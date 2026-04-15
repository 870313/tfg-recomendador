import { realm } from './RealmInstance';
/**
 * Retrieves all exclusion sets from the Realm database, sorted by their `pos` property.
 *
 * @returns {Realm.Results | null} A list of ExclusionSet objects sorted by position, or null if none exist.
 */
export function retrieveExclusionSetsSortByPos() {
    // Get all 'ExclusionSet' objects and sort them by the 'pos' field
    const exclusionSets = realm.objects('ExclusionSet').sorted('pos');

    // Return the sorted list if there are any results, otherwise return null
    return exclusionSets.length > 0 ? exclusionSets : null;
}

/**
 * Retrieves a single exclusion set from the Realm database based on its position (`pos`).
 *
 * @param {number} pos - The position value to search for.
 * @returns {Object|null} The first exclusion set matching the position, or null if not found.
 */
export function retrieveExclusionSetByPos(pos) {
    // Filter ExclusionSet objects where 'pos' matches the given value
    const exclusionSet = realm.objects('ExclusionSet').filtered('pos == $0', pos);

    // Return the first match or null if no match is found
    return exclusionSet.length > 0 ? exclusionSet[0] : null;
}

/**
 * Stores a new exclusion set in the Realm database.
 *
 * @param {string} name - The name of the exclusion set.
 * @param {Array<{selection: string}>} recommendationTypes - Array of objects containing the selected recommendation types.
 */
export function storeExclusionSet(name, recommendationTypes) {
  console.log('storeExclusionSet');

  // Get the current maximum id from existing exclusion sets
  const lastExclusionSet = realm.objects('ExclusionSet').sorted('id', true)[0];
  const maxId = lastExclusionSet ? lastExclusionSet.id : 0;
  const newId = maxId === 0 ? 1 : maxId + 1;

  // Extract only the 'selection' strings from the passed array
  const recommendationTypeArray = recommendationTypes.map(item => item.selection);
  console.log(recommendationTypeArray);

  // Write new exclusion set to Realm database
  realm.write(() => {
    realm.create('ExclusionSet', {
      id: newId,
      name,
      pos: newId,
      recommendationType: recommendationTypeArray,
    });
  });
}

/**
 * Updates an existing exclusion set in the Realm database.
 *
 * @param {number} id - The ID of the exclusion set to update.
 * @param {string} name - The new name for the exclusion set.
 * @param {number} pos - The position or order of the exclusion set.
 * @param {Array<{selection: string}>} recommendationTypes - Array of objects containing the selected recommendation types.
 */
export function updateExclusionSet(id, name, pos, recommendationTypes) {
  console.log('updateExclusionSet');

  // Extract the 'selection' values from recommendationTypes
  const recommendationTypeArray = recommendationTypes.map(item => item.selection);
  console.log(recommendationTypeArray);

  // Write the updated exclusion set to Realm, with `true` to indicate update mode
  realm.write(() => {
    realm.create(
      'ExclusionSet',
      {
        id,
        name,
        pos,
        recommendationType: recommendationTypeArray,
      },
      true // overwrite existing object with same primary key
    );
  });
}

/**
 * Updates the position (`pos`) of an existing exclusion set in the Realm database.
 * If the exclusion set with the given `id` exists, its `pos` will be updated.
 *
 * @param {number|string} id - The primary key of the exclusion set to update.
 * @param {number} pos - The new position to assign.
 */
export function updateExclusionSetPos(id, pos) {
    console.log('updateExclusionSet');

    // Write transaction to update the exclusion set with new position
    realm.write(() => {
      realm.create(
        'ExclusionSet',
        {
          id: id,
          pos: pos,
        },
        true // 'true' indicates an update if the object already exists
      );
    });
  }

/**
 * Deletes an exclusion set from the Realm database by its primary key (`id`).
 *
 * @param {string | number} id - The primary key of the exclusion set to delete.
 */
export function deleteExclusionSetById(id) {
    // Open a write transaction to modify the Realm database
    realm.write(() => {
      // Find the ExclusionSet by primary key and delete it
      const exclusionSet = realm.objectForPrimaryKey('ExclusionSet', id);
      if (exclusionSet) {
        realm.delete(exclusionSet);
      }
    });
  }
