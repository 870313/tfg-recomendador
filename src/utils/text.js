/**
 * Normalizes a string for matching:
 *   - lowercases,
 *   - decomposes accented characters via Unicode NFD,
 *   - strips combining diacritic marks,
 *   - collapses runs of whitespace,
 *   - trims edges.
 *
 * Examples:
 *   "Museo Pablo Gargallo"  → "museo pablo gargallo"
 *   "MUSEÓ"                 → "museo"
 *   "  Café\tCentral  "     → "cafe central"
 *
 * @param {string|null|undefined} s
 * @returns {string}
 */
export function normalizeText(s) {
  if (s == null) {
    return '';
  }
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes a normalized string by whitespace.
 * Empty / null inputs → [].
 * Example: Museo Pablo Gargallo → ["museo", "pablo", "gargallo"]
 * Example: Cafe Central → ["cafe", "central"]
 *
 * @param {string|null|undefined} s
 * @returns {Array<string>}
 */
export function tokenize(s) {
  const n = normalizeText(s);
  if (!n) {
    return [];
  }
  return n.split(' ');
}
