/**
 * Recommends POIs matching the user's keyword(s) in name, type or description.
 * Case and accent insensitive. Score = matched terms / total terms.
 * Example: "museo goya" → POI "Museo Goya" scores 1.0, "Museo del Foro" scores 0.5.
 * No fallback to random — empty search means no matches.
 */

import BaseAlgorithm from './BaseAlgorithm';
import {normalizeText, tokenize} from '../../utils/text';

const DEFAULT_MAX_ITEMS = 10;

class KeywordAlgorithm extends BaseAlgorithm {
  static id = 'keyword';
  static requiresEM = false;

  score(user, pois, context = {}) {
    if (!Array.isArray(pois) || pois.length === 0) {
      return [];
    }

    const tokens = tokenize(context.keyword);
    if (tokens.length === 0) {
      return [];
    }

    const maxItems = context.maxItems ?? DEFAULT_MAX_ITEMS;

    const scored = [];
    // Combine all searchable fields into one normalized string
    for (const poi of pois) {
      const haystack = normalizeText(
        `${poi.name ?? ''} ${poi.type ?? ''} ${poi.description ?? ''}`,
      );
      if (!haystack) {
        continue;
      }

      let hits = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) {
          hits++;
        }
      }
      if (hits === 0) {
        continue;
      }

      scored.push({poiId: poi.id, score: hits / tokens.length});
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, maxItems);
  }
}

export default new KeywordAlgorithm();
