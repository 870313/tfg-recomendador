/**
 * Recommends POIs closest to the user using Haversine distance.
 * Score: 1.0 at user's position, 0.0 at maxDistance boundary.
 * Falls back to RandomAlgorithm if no POIs are in range (same as PASEO).
 * Defaults: maxDistance = 2000m, maxItems = 10.
 */

import BaseAlgorithm from './BaseAlgorithm';
import RandomAlgorithm from './RandomAlgorithm';
import {haversineMeters, hasValidCoords} from '../../utils/geo';

const DEFAULT_MAX_DISTANCE_M = 2000;
const DEFAULT_MAX_ITEMS = 10;

class ClosenessAlgorithm extends BaseAlgorithm {
  static id = 'closeness';
  static requiresEM = false;

  score(user, pois, context = {}) {
    if (!Array.isArray(pois) || pois.length === 0) {
      return [];
    }

    if (!user || !hasValidCoords(user.lat, user.lon)) {
      console.warn(
        '[ClosenessAlgorithm] missing/invalid user coordinates → returning []',
      );
      return [];
    }

    const maxDistance = context.maxDistance ?? DEFAULT_MAX_DISTANCE_M;
    const maxItems = context.maxItems ?? DEFAULT_MAX_ITEMS;

    const scored = [];
    for (const poi of pois) {
      if (!hasValidCoords(poi.latitude, poi.longitude)) {
        continue;
      }
      const dist = haversineMeters(
        user.lat,
        user.lon,
        poi.latitude,
        poi.longitude,
      );
      if (dist > maxDistance) {
        continue;
      }
      const score = 1 - dist / maxDistance;
      scored.push({poiId: poi.id, score});
    }

    if (scored.length === 0) {
      console.log(
        '[ClosenessAlgorithm] no POIs in range → falling back to RandomAlgorithm',
      );
      return RandomAlgorithm.score(user, pois, context);
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, maxItems);
  }
}

export default new ClosenessAlgorithm();
