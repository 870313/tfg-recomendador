/**
 * ZaragozaDataSource.js
 * -----------------------------------------------------------------------------
 * Centralized access point for Zaragoza Open Data (datos.zaragoza.es) via SPARQL.
 *
 * All outgoing requests to the Zaragoza dataset MUST go through this module.
 * Keeping the I/O in a single place makes it easier to:
 *   - swap the endpoint / query language in the future (e.g. REST, GraphQL),
 *   - add caching / retry / rate-limit policies,
 *   - plug additional data sources (another city, another catalog).
 *
 * Exposed API:
 *   - executeSPARQL(query)           -> raw SPARQL JSON results
 *   - getAllPOIs(limit?)             -> array of normalized POI objects
 *   - searchPOIs(keyword, limit?)    -> array of POIs whose name contains keyword
 *   - syncPOIs(limit?)               -> downloads and upserts POIs into Realm
 *
 * Data model observed in the Zaragoza catalog (from live exploration):
 *   Tourist POIs live under URIs of the form
 *     http://www.zaragoza.es/api/recurso/turismo/<category>/<id>
 *   with these relevant predicates:
 *     - rdf:type       -> kos URI, e.g. http://vocab.linkeddata.es/kos/turismo/restaurante
 *     - rdfs:label     -> human readable name (also available as dcterms:title / schema:name)
 *     - rdfs:comment   -> short description (optional)
 *     - geo:geometry   -> URI of the form .../geometry/WGS84/<lat>_<lon>
 *                        (the POI also has EPSG25830 / EPSG23030 geometries;
 *                         we explicitly filter to WGS84)
 *   Photos (foaf:depiction / schema:image) are not reliably present and are
 *   therefore left as OPTIONAL — POIs without a photo are still stored.
 * -----------------------------------------------------------------------------
 */

import {realm} from '../realmSchemas/RealmInstance';

// SPARQL endpoint exposed by the Zaragoza Open Data portal.
const SPARQL_ENDPOINT = 'https://datos.zaragoza.es/sparql';

// Prefix that every tourist POI URI must start with.
const TURISMO_URI_PREFIX = 'http://www.zaragoza.es/api/recurso/turismo/';

// Prefix of the WGS84 geometry URIs (we ignore the EPSG25830 / EPSG23030 ones).
const WGS84_GEOM_PREFIX = 'http://www.zaragoza.es/api/recurso/geometry/WGS84/';

// Default number of POIs to fetch on a full sync (same value used in PASEO).
const DEFAULT_POI_LIMIT = 2000;

// ---------------------------------------------------------------------------
// SPARQL query construction
// ---------------------------------------------------------------------------

/**
 * Builds the SPARQL query used to retrieve tourist POIs.
 *
 * Notes on the design (tuned against the live Virtuoso endpoint):
 *   - We match ?poi geo:geometry ?geom and then FILTER the geometry URI to
 *     WGS84 only. This is faster than joining against the geometry resource
 *     because the lat/lon pair is already encoded in the URI itself.
 *   - Only ONE OPTIONAL block is used (rdfs:comment). Adding a second OPTIONAL
 *     (e.g. foaf:depiction for photos) consistently makes the endpoint return
 *     HTTP 500 above ~10 rows — the query planner explodes. Live probing also
 *     showed foaf:depiction is not present for /turismo/ POIs, so dropping it
 *     from the query costs nothing. Photos remain a schema field that can be
 *     populated later from a different source.
 *   - ORDER BY is intentionally omitted: it also triggers endpoint errors on
 *     larger result sets.
 *
 * @param {number} limit  Max number of results.
 * @param {string} [keyword]  Optional substring filter on the POI name.
 * @returns {string} The SPARQL query.
 */
function buildPOIsQuery(limit, keyword) {
  const keywordFilter = keyword
    ? `FILTER(CONTAINS(LCASE(STR(?name)), LCASE("${escapeSPARQLLiteral(
        keyword,
      )}")))`
    : '';

  return `
    PREFIX geo:  <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT ?uri ?type ?name ?geom ?description WHERE {
      ?uri a ?type ;
           geo:geometry ?geom ;
           rdfs:label ?name .
      FILTER(STRSTARTS(STR(?uri), "${TURISMO_URI_PREFIX}"))
      FILTER(STRSTARTS(STR(?geom), "${WGS84_GEOM_PREFIX}"))
      OPTIONAL { ?uri rdfs:comment ?description . }
      ${keywordFilter}
    }
    LIMIT ${limit}
  `;
}

/**
 * Escapes a string so it can be safely embedded inside a SPARQL literal.
 * Minimal escape: backslashes and double quotes.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeSPARQLLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ---------------------------------------------------------------------------
// Low-level SPARQL execution
// ---------------------------------------------------------------------------

/**
 * Executes a SPARQL query against the Zaragoza endpoint and returns the parsed
 * JSON response.
 *
 * Uses GET with query parameters because the Virtuoso instance behind
 * datos.zaragoza.es has been observed to respond more reliably to GET than to
 * URL-encoded POST for complex queries.
 *
 * @param {string} query  A valid SPARQL query.
 * @returns {Promise<Object>} The SPARQL JSON response (bindings under
 *   `results.bindings`).
 * @throws {Error} When the HTTP request fails.
 */
export async function executeSPARQL(query) {
  const url =
    SPARQL_ENDPOINT +
    '?query=' +
    encodeURIComponent(query) +
    '&format=' +
    encodeURIComponent('application/sparql-results+json');

  const response = await fetch(url, {
    method: 'GET',
    headers: {Accept: 'application/sparql-results+json'},
  });

  if (!response.ok) {
    throw new Error(
      `[ZaragozaDataSource] SPARQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extracts [latitude, longitude] from a WGS84 geometry URI of the form
 *   http://www.zaragoza.es/api/recurso/geometry/WGS84/41.649273_-0.899797
 *
 * @param {string} geomUri
 * @returns {[number, number] | null}
 */
function parseCoordsFromGeom(geomUri) {
  const m = /WGS84\/(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)/.exec(geomUri);
  if (!m) {
    return null;
  }
  const lat = parseFloat(m[1]);
  const lon = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }
  return [lat, lon];
}

/**
 * Derives a stable numeric ID from a POI URI. Zaragoza tourist URIs end with a
 * numeric identifier (e.g. ".../restaurante/1060"), which is the natural
 * primary key.
 *
 * Fallback: 31-bit djb2 hash of the full URI, in case the URI doesn't end with
 * digits (shouldn't happen under the /turismo/ prefix, but we stay defensive).
 *
 * @param {string} uri
 * @returns {number}
 */
function uriToIntId(uri) {
  const tailMatch = /(\d+)\/?$/.exec(uri);
  if (tailMatch) {
    const parsed = parseInt(tailMatch[1], 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  let hash = 5381;
  for (let i = 0; i < uri.length; i++) {
    hash = ((hash << 5) + hash + uri.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

/**
 * Converts raw SPARQL bindings into normalized POI objects. Rows sharing the
 * same POI URI are merged into a single object whose `type` field is a
 * ';'-separated list of distinct types. Photos and descriptions take the first
 * non-empty value encountered.
 *
 * @param {Array<Object>} bindings  `results.bindings` from the SPARQL response.
 * @returns {Array<Object>} Normalized POIs ready to be stored in Realm.
 */
function mergeBindingsByURI(bindings) {
  const byUri = new Map();

  for (const binding of bindings) {
    const uri = binding.uri?.value;
    const name = binding.name?.value;
    const geom = binding.geom?.value;
    if (!uri || !name || !geom) {
      continue;
    }

    const coords = parseCoordsFromGeom(geom);
    if (!coords) {
      continue;
    }

    const type = binding.type?.value ?? '';
    const description = binding.description?.value ?? null;
    const photoUrl = binding.photo?.value ?? null;

    const existing = byUri.get(uri);
    if (!existing) {
      byUri.set(uri, {
        id: uriToIntId(uri),
        name,
        latitude: coords[0],
        longitude: coords[1],
        type,
        description,
        photoUrl,
        source: 'zaragoza',
        lastUpdated: new Date(),
      });
      continue;
    }

    // Merge type into a ';'-separated unique list.
    const types = new Set(existing.type ? existing.type.split(';') : []);
    if (type) {
      types.add(type);
    }
    existing.type = Array.from(types).join(';');

    // Keep the first non-empty description / photo.
    if (!existing.description && description) {
      existing.description = description;
    }
    if (!existing.photoUrl && photoUrl) {
      existing.photoUrl = photoUrl;
    }
  }

  return Array.from(byUri.values());
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieves all tourist POIs from the Zaragoza catalog (up to `limit`).
 *
 * @param {number} [limit=DEFAULT_POI_LIMIT]
 * @returns {Promise<Array<Object>>} Array of normalized POIs.
 */
export async function getAllPOIs(limit = DEFAULT_POI_LIMIT) {
  console.log(`[ZaragozaDataSource] getAllPOIs(limit=${limit})`);

  const query = buildPOIsQuery(limit);
  const json = await executeSPARQL(query);
  const bindings = json?.results?.bindings ?? [];

  const pois = mergeBindingsByURI(bindings);
  console.log(
    `[ZaragozaDataSource] getAllPOIs -> ${pois.length} POIs (from ${bindings.length} rows)`,
  );
  return pois;
}

/**
 * Searches tourist POIs whose name contains the given keyword (case-insensitive).
 *
 * @param {string} keyword
 * @param {number} [limit=DEFAULT_POI_LIMIT]
 * @returns {Promise<Array<Object>>}
 */
export async function searchPOIs(keyword, limit = DEFAULT_POI_LIMIT) {
  console.log(`[ZaragozaDataSource] searchPOIs("${keyword}", limit=${limit})`);

  if (!keyword || !keyword.trim()) {
    return getAllPOIs(limit);
  }

  const query = buildPOIsQuery(limit, keyword.trim());
  const json = await executeSPARQL(query);
  const bindings = json?.results?.bindings ?? [];

  const pois = mergeBindingsByURI(bindings);
  console.log(`[ZaragozaDataSource] searchPOIs -> ${pois.length} matches`);
  return pois;
}

/**
 * Synchronizes Zaragoza POIs into the local Realm database.
 * Performs an upsert: existing POIs (same primary key) are updated, new ones
 * are inserted. Does NOT delete POIs that disappeared from the remote catalog
 * (that decision is intentionally deferred; we can revisit it later).
 *
 * @param {number} [limit=DEFAULT_POI_LIMIT]
 * @returns {Promise<{inserted: number, total: number}>}
 */
export async function syncPOIs(limit = DEFAULT_POI_LIMIT) {
  console.log('[ZaragozaDataSource] syncPOIs(): starting');

  let pois;
  try {
    pois = await getAllPOIs(limit);
  } catch (error) {
    console.error('[ZaragozaDataSource] syncPOIs(): fetch failed', error);
    throw error;
  }

  let written = 0;
  realm.write(() => {
    for (const poi of pois) {
      try {
        realm.create('ZaragozaPOI', poi, 'modified'); // upsert
        written++;
      } catch (err) {
        console.warn('[ZaragozaDataSource] failed to store POI', poi?.id, err);
      }
    }
  });

  console.log(
    `[ZaragozaDataSource] syncPOIs(): stored ${written}/${pois.length} POIs`,
  );
  return {inserted: written, total: pois.length};
}
