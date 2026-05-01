/**
 * Base class for recommendation algorithms.
 * All algorithms must extend this class and implement score().
 */
export default class BaseAlgorithm {
  /** Unique algorithm identifier (stored in RecommendationCache). */
  static id = 'base';

  /** If true, this algorithm needs the EM backend to work. */
  static requiresEM = false;

  /**
   * @param {Object} user - { id, lat?, lon? }
   * @param {Array<Object>} pois - plain ZaragozaPOI objects
   * @param {Object} [context] - { maxItems, maxDistance, keyword, ... }
   * @returns {Array<{poiId: number, score: number}>} sorted DESC by score
   */
  score(user, pois, context) {
    throw new Error('Subclasses must implement score()');
  }
}
