// profileSettingsService.js
import { realm } from './RealmInstance';
import * as Schemas from './RealmServices';

/**
 * Retrieves the current user token from the schema.
 * @returns {string} The current user token.
 */
export const getCurrentToken = () => {
    return Schemas.currentToken();
};

/**
 * Loads the profile-related settings from Realm for a given user.
 * @param {string} token - The user ID token.
 * @param {Array<{key: string, value: boolean}>} defaultCheckbox - The default checkbox state array.
 * @returns {{
 *   checkbox: Array<{key: string, value: boolean}>,
 *   location: boolean,
 *   refresh: string,
 *   distance: string
 * }} The updated settings values for UI state.
 */
export const loadProfileSettings = (token, defaultCheckbox) => {
  const settings = realm.objects('Setting');
  const updatedCheckbox = [...defaultCheckbox];
  // Update checkbox values based on Realm-stored values
  updatedCheckbox.forEach((element) => {
    const property = settings.filtered(
      `userId = "${token}" AND type="PROFILE" AND key = "${element.key}"`
    );
    if (property.length > 0) {
      element.value = property[0].value;
    }
  });
  // Retrieve additional stored values for location, refresh rate, and distance
  const location = Schemas.retrieveValueSetting(token, 'PROFILE', 'Location');
  const refresh = Schemas.retrieveValueParameter(token, 'PROFILE', 'RATE') || '3';
  const distance = Schemas.retrieveValueParameter(token, 'PROFILE', 'DISTANCE') || '5';
  return {
    checkbox: updatedCheckbox,
    location,
    refresh,
    distance,
  };
};

/**
 * Toggles a boolean setting value in the Realm database.
 * Creates the setting if it doesn't exist.
 * @param {string} token - The user ID token.
 * @param {{key: string, value: boolean}} item - The setting item to toggle.
 * @returns {boolean} The new toggled value.
 */
export const toggleSetting = (token, item) => {
  const settings = realm.objects('Setting');
  realm.write(() => {
    const property = settings.filtered(
      `userId = "${token}" AND type="PROFILE" AND key = "${item.key}"`
    );
    if (property.length > 0) {
      // Toggle existing value
      property[0].value = !item.value;
    } else {
      // Create new setting if it doesn't exist
      realm.create('Setting', {
        userId: token,
        type: 'PROFILE',
        key: item.key,
        value: !item.value,
      });
    }
  });
  return !item.value; // Return the new value after toggling
};

/**
 * Stores the new refresh rate in the Realm database.
 * @param {string} token - The user ID token.
 * @param {string} value - The new refresh rate to store.
 * @returns {{success: boolean}} Whether the value was valid and saved.
 */
export const updateRate = (token, value) => {
  const number = parseInt(value, 10);
  if (Number.isInteger(number)) {
    Schemas.storeParameter(token, 'PROFILE', 'RATE', value);
    return { success: true };
  }
  return { success: false };
};
/**
 * Stores the new distance value in the Realm database.
 * @param {string} token - The user ID token.
 * @param {string} value - The new distance to store.
 * @returns {{success: boolean}} Whether the value was valid and saved.
 */
export const updateDistance = (token, value) => {
  const number = parseInt(value, 10);
  if (Number.isInteger(number)) {
    Schemas.storeParameter(token, 'PROFILE', 'DISTANCE', value);
    return { success: true };
  }
  return { success: false };
};

