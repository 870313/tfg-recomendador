/**
 * Orchestrates the recommendation pipeline:
 * resolves user and POIs from Realm, runs the selected algorithm,
 * caches results, and returns hydrated POIs to the UI.
 *
 * This is the only recommendation module that touches Realm.
 * Algorithms are pure functions that receive data and return scores.
 */

import {getAlgorithm} from './AlgorithmRegistry';
import {
  retrieveUser,
  retrieveCurrentLocation,
  getAllZaragozaPOIs,
  clearRecommendationCache,
  getValorations,
} from '../realmSchemas/RealmServices';
import {realm} from '../realmSchemas/RealmInstance';

/**
 * Get recommendations for a user using the specified algorithm.
 *
 * @param {string} algorithmId - 'random' | 'closeness' | 'keyword' | ...
 * @param {string} [userId] - defaults to current logged-in user
 * @param {Object} [context] - { maxItems, maxDistance, keyword, ... }
 * @param {boolean} [persist=true] - save results to RecommendationCache
 * @returns {Promise<Array<{poiId, score, poi}>>} sorted DESC by score
 */
export async function recommend({
  algorithmId,
  userId,
  context = {},
  persist = true,
}) {
  // 1. Find the algorithm
  const algorithm = getAlgorithm(algorithmId);
  if (!algorithm) {
    throw new Error(
      `[RecommendationEngine] unknown algorithm: "${algorithmId}"`,
    );
  }

  // 2. Resolve user + last known GPS position
  const resolvedUserId = userId ?? retrieveUser()?.name;
  if (!resolvedUserId) {
    console.warn('[RecommendationEngine] no user found');
    return [];
  }

  const lastPos = retrieveCurrentLocation();
  const user = {
    id: resolvedUserId,
    lat: lastPos?.lat,
    lon: lastPos?.lon,
  };

  // 3. Load POIs from Realm and, when the bridge has provided a
  //    recommendationType (or explicit matchKeywords derived from it),
  //    pre-filter by that type so the algorithm only sees POIs consistent
  //    with what the triggering rule requested. Without this filter, the
  //    closeness algorithm returns the N nearest POIs regardless of type,
  //    which mixes restaurants with monuments when the user's rule said
  //    "Restaurants" (bug reported after the field trial on Android).
  const allPois = getAllZaragozaPOIs();
  if (allPois.length === 0) {
    console.warn('[RecommendationEngine] no POIs in Realm');
    return [];
  }
  const pois = filterPoisByType(allPois, context);
  if (pois.length === 0) {
    console.warn(
      `[RecommendationEngine] no POIs match recommendationType="${context.recommendationType}" ` +
        `(matchKeywords=${JSON.stringify(context.matchKeywords ?? [])}); ` +
        'algorithm will run over the empty set',
    );
    return [];
  }

  // 4. Load extra data if the algorithm needs it (e.g. valorations for CustomAlgorithm)
  let enrichedContext = context;
  if (algorithm.constructor.requiresValorations === true) {
    enrichedContext = {
      ...context,
      valorations: getValorations(resolvedUserId),
    };
  }

  // 5. Run algorithm (pure function, no Realm access)
  const scored = algorithm.score(user, pois, enrichedContext) ?? [];

  // 6. Cache results (replace previous batch for this user+algorithm)
  if (persist && scored.length > 0) {
    persistBatch(resolvedUserId, algorithmId, scored);
  }

  // 7. Attach full POI data for the UI
  const poisById = new Map(pois.map(p => [p.id, p]));
  return scored.map(s => ({...s, poi: poisById.get(s.poiId) ?? null}));
}

/**
 * Filter POIs whose declared type matches the recommendation type of the
 * triggering rule. Matching strategy:
 *
 *   1. If context.matchKeywords is a non-empty array (typically injected by
 *      the RecommendationBridge from its typeToKeywords map), keep any POI
 *      whose `type` contains at least one of those keywords (case- and
 *      accent-insensitive substring match).
 *   2. Otherwise, if context.recommendationType is set, fall back to a
 *      case-insensitive substring match against the type token itself,
 *      handling the trivial English plural ("Restaurants" → "restaurant"
 *      → matches "Restaurante", "restaurantes"...).
 *   3. If neither is set (manual generation from the Recommendations
 *      screen with no rule context), return every POI as before.
 *
 * The comparison is intentionally loose to bridge the mismatch between
 * the English recommendation types the rules use ("Restaurants") and the
 * Spanish type labels served by datos.zaragoza.es ("Restaurante").
 */
function filterPoisByType(pois, context = {}) {
  const keywords = Array.isArray(context.matchKeywords)
    ? context.matchKeywords.filter(Boolean)
    : [];
  const recType = context.recommendationType;
  if (keywords.length === 0 && (!recType || recType === '')) {
    return pois;
  }
  const norm = s =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  const needles =
    keywords.length > 0
      ? keywords.map(norm)
      : [norm(recType).replace(/s$/, '')];
  return pois.filter(poi => {
    const type = norm(poi.type);
    return needles.some(n => n.length > 0 && type.includes(n));
  });
}

/** Replace cached recommendations for a user+algorithm pair. */
function persistBatch(userId, algorithmId, scored) {
  clearRecommendationCache(userId, algorithmId);
  const now = new Date();
  realm.write(() => {
    for (const {poiId, score} of scored) {
      realm.create(
        'RecommendationCache',
        {
          id: `${userId}_${algorithmId}_${poiId}`,
          userId,
          poiId,
          score,
          algorithm: algorithmId,
          timestamp: now,
        },
        'modified',
      );
    }
  });
}
