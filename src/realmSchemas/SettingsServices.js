import { realm } from './RealmInstance';

/**
 * Retrieves all settings for a given user with type "SETTINGS".
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Realm.Results} - A collection of Realm objects matching the query.
 */
export const getSettingsForUser = (userId) => {
  return realm.objects('Setting').filtered(`userId = "${userId}" AND type = "SETTINGS"`);
};

/**
 * Gets the value of a specific setting key for a user.
 *
 * @param {string} userId - The user's unique ID.
 * @param {string} key - The setting key to retrieve.
 * @returns {boolean|null} - The value of the setting, or null if not found.
 */
export const getSettingValue = (userId, key) => {
  const results = realm.objects('Setting').filtered(
    `userId = "${userId}" AND type = "SETTINGS" AND key = "${key}"`
  );
  return results.length > 0 ? results[0].value : null;
};

/**
 * Toggles the value of a specific setting. If the setting doesn't exist, it creates it with the opposite value.
 *
 * @param {string} userId - The user's unique ID.
 * @param {string} key - The setting key to toggle.
 * @param {boolean} currentValue - The current value of the setting.
 */
export const toggleSettingValue = (userId, key, currentValue) => {
  realm.write(() => {
    const result = realm.objects('Setting').filtered(
      `userId = "${userId}" AND type = "SETTINGS" AND key = "${key}"`
    );
    if (result.length > 0) {
      result[0].value = !currentValue;
    } else {
      realm.create('Setting', {
        userId,
        type: 'SETTINGS',
        key,
        value: !currentValue,
      });
    }
  });
  return !currentValue; // Return the new value after toggling
};

/**
 * Merges a user's saved settings with the default share options.
 *
 * @param {string} userId - The user's unique ID.
 * @param {Array<{key: string, value: boolean}>} defaultOptions - Array of default settings.
 * @returns {Array<{key: string, value: boolean}>} - Updated options array with values from the database if available.
 */
export const getMergedShareOptions = (userId, defaultOptions) => {
  const settings = realm.objects('Setting').filtered(
    `userId = "${userId}" AND type = "SETTINGS"`
  );

  return defaultOptions.map((item) => {
    const match = settings.filtered(`key = "${item.key}"`);
    return {
      ...item,
      value: match.length > 0 ? match[0].value : item.value,
    };
  });
};

