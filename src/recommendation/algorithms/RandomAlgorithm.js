/**
 * Assigns random scores to POIs and returns the top N.
 * Used for exploration and as fallback when other algorithms find no results.
 */
import BaseAlgorithm from './BaseAlgorithm';

const DEFAULT_MAX_ITEMS = 10;

class RandomAlgorithm extends BaseAlgorithm {
  static id = 'random';
  static requiresEM = false;

  score(user, pois, context = {}) {
    if (!Array.isArray(pois) || pois.length === 0) {
      return [];
    }

    const maxItems = context.maxItems ?? DEFAULT_MAX_ITEMS;

    // Don't shuffle in place — other algorithms may reuse the input array

    return pois
      .map(poi => ({poiId: poi.id, score: Math.random()}))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);
  }
}

export default new RandomAlgorithm();
