import * as Schemas from '../../realmSchemas/ExclusionSetsServices';
/**
 * Filters recommendations applying exclusion sets rules.
 *
 * If exclusion sets exist, returns recommendations with priority according to exclusion sets,
 * plus recommendations not included in any exclusion set.
 *
 * @param {string[]} recommendations - List of recommendation strings.
 * @returns {string[]} Filtered list of recommendations according to exclusion sets.
 */
export function getRecommendationsWithExclusionSets(recommendations) {
    console.log('Recommendations: ' + recommendations);

    // Retrieve exclusion sets sorted by position
    const exclusionSets = Schemas.retrieveExclusionSetsSortByPos();

    if (exclusionSets == null) {
        // If no exclusion sets, return all recommendations
        return recommendations;
    } else {
        let result = [];
        let notIncluded = [];
        let discarded = [];

        // Process each exclusion set to determine priority and exclusions
        exclusionSets.forEach(set => {
            const exclusionSetResult = checkExclusionSet(set.recommendationType, recommendations, discarded);
            result.push(exclusionSetResult[0]);      // recommendation with priority
            notIncluded = notIncluded.concat(exclusionSetResult[1]); // recommendations not included
            discarded = discarded.concat(exclusionSetResult[2]);     // discarded recommendations
        });

        console.log('Result: ' + result);
        console.log('NotIncluded: ' + notIncluded);
        console.log('Discarded: ' + discarded);

        if (result.length === 0) {
            // If no recommendations match any exclusion set, return all recommendations
            return recommendations;
        } else {
            // Remove duplicates
            result = [...new Set(result)];

            if (notIncluded.length === 0) {
                // If all recommendations are included in exclusion sets, return the filtered result
                return result;
            } else {
                // Get recommendations not discarded by any exclusion set
                let aux = getNotIncluded(discarded, notIncluded);

                // Filter aux to only those not already in result
                aux = getNotIncluded(result, aux);

                // Combine prioritized recommendations with these additional ones
                return result.concat(aux);
            }
        }
    }
}

/**
 * Evaluates an exclusion set to determine:
 * - The recommendation with priority within the set,
 * - Recommendations not included in the exclusion set,
 * - Recommendations discarded due to exclusion set rules.
 *
 * @param {string[]} exclusionSet - Array of recommendation types in the exclusion set.
 * @param {string[]} recommendations - Array of current recommendations.
 * @param {string[]} discarded - Array of already discarded recommendations.
 * @returns {[string, string[], string[]]} Tuple with:
 *    - prioritized recommendation (string),
 *    - recommendations not included in the exclusion set (array),
 *    - updated discarded recommendations (array).
 */
function checkExclusionSet(exclusionSet, recommendations, discarded) {
    console.log('checkExclusionSet: ' + exclusionSet);
    let result = '';
    const normalizedSet = [];
    let found = false;

    for (let i = 0; i < exclusionSet.length; i++) {
        // Normalize recommendation type: lowercase first letter, remove spaces
        let r = exclusionSet[i].charAt(0).toLowerCase() + exclusionSet[i].slice(1);
        r = r.replace(/\s/g, '');
        normalizedSet.push(r);

        if (recommendations.includes(r)) {
            if (!found && !discarded.includes(r)) {
                // The first matching and not discarded recommendation has priority
                result = r;
                found = true;
            } else {
                // Others are discarded
                discarded.push(r);
            }
        }
    }

    // Get recommendations from normalized set that are not in the current recommendations
    const notIncludedSet = getNotIncluded(normalizedSet, recommendations);

    return [result, notIncludedSet, discarded];
}

/**
 * Filters recommendations that are in the `notIncluded` list but not in the `result` list,
 * removing duplicates.
 *
 * @param {string[]} result - Array of prioritized recommendations.
 * @param {string[]} notIncluded - Array of recommendations not included in exclusion sets.
 * @returns {string[]} Filtered array with elements in `notIncluded` that are not in `result`.
 */
function getNotIncluded(result, notIncluded) {
    console.log('getNotIncluded');
    // Filter elements of notIncluded that are NOT present in result
    const filtered = notIncluded.filter(e => !result.includes(e));
    // Remove duplicates by converting to Set and back to Array
    return [...new Set(filtered)];
}
