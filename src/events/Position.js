//Geolocation
import Geolocation from 'react-native-geolocation-service';

//Permissions
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Platform } from 'react-native';

//Oauth
import * as oauth from '../../oauth.json';
//Schemas
import * as Schemas from '../realmSchemas/RealmServices';

// Radius of the earth in km 6371; circumference 40075 km
// 1 km is 1 * (360/40075) = 0.008983 degrees
const Degree = 0.008983;

/**
 * Checks and requests location permission on iOS/Android.
 *
 * @returns {Promise<boolean>} True if granted.
 */
async function checkLocationPermission() {
    const permissionType =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    let status = await check(permissionType);
    if (status === RESULTS.DENIED) {
      status = await request(permissionType);
    }
    return status === RESULTS.GRANTED;
}

/**
 * Retrieves the user's current location using react-native-geolocation-service.
 *
 * @returns {Promise<GeolocationResponse|null>}
 */
export const getLocationAsync = async () => {
    console.log('getLocationAsync(): start');

    const token = Schemas.currentToken();
    if (!token) {
      console.warn('getLocationAsync(): user token is null');
      return null;
    }

    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      console.warn('getLocationAsync(): location permission denied');
      return null;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      console.log('getLocationAsync(): position =', position);

      Schemas.CreateContext('LOCATION', JSON.stringify(position));
      getCurrentWeather(position);
      Schemas.storeLocation(token, position);

      console.log('getLocationAsync(): location stored successfully');
      return position;

    } catch (error) {
      console.error('getLocationAsync(): ERROR', error);
      throw error;
    }
};

/**
 * Fetches the current weather data from OpenWeatherMap based on given location.
 *
 * @param {Object} location - The location object with latitude and longitude.
 * @returns {Promise<boolean>} True if weather data was successfully fetched and stored.
 */
export async function getCurrentWeather(location) {
    try {
      if (!location || !location.coords) {
        console.warn('getCurrentWeather(): invalid location object');
        return false;
      }

      const { latitude, longitude } = location.coords;
      const apiKey = oauth.openweathermap;

      const url = 'https://api.openweathermap.org/data/2.5/weather' +
                  `?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

      console.log(`getCurrentWeather(): fetching weather from ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`getCurrentWeather(): fetch failed with status ${response.status}`);
        return false;
      }

      const weatherData = await response.json();

      // Save weather data to Realm
      Schemas.CreateContext('WEATHER', JSON.stringify(weatherData));

      console.log('getCurrentWeather(): weather data saved');
      return true;

    } catch (error) {
      console.error('getCurrentWeather(): error while fetching weather', error);
      return false;
    }
}

/**
 * Adds a noise (up to 0.5Km) to the coordinate to simulate inaccuracy
 * @param {number} lat - Latitude to be modified
 * @param {number} lon - Longitude to be modified
 * @returns {Object} - The noisy latitude and longitude
 */
export const noiseCoordinate = (lat, lon) => {
    const DEGREE = Degree;
    const randomFactor = Math.random();  // Random factor between 0 and 1

    // Randomly determine the sign for noise (+ or -)
    const sign = Math.random() > 0.5 ? -1 : 1;

    // Add noise to latitude and longitude
    const noisyLat = lat + sign * randomFactor * DEGREE;
    const noisyLon = lon - sign * (1 - randomFactor) * DEGREE;

    // Return the noisy coordinates as an object
    return { lat: noisyLat, lon: noisyLon };
};

/**
 * Retrieves the current GPS coordinates as a string in "longitude,latitude" format.
 *
 * This function checks for location permissions before accessing the device's geolocation.
 * If the permission is granted and the location is obtained successfully, it resolves with
 * the coordinates as a comma-separated string.
 *
 * @returns {Promise<string|null>} A promise that resolves with the coordinates string, or null if permission is denied.
 */
export const getLocationAsyncForRules = async () => {
  console.log('getLocationAsyncForRules(): start');

  const hasPermission = await checkLocationPermission();
  if (!hasPermission) {
    console.warn('getLocationAsyncForRules(): location permission denied');
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 1000,
        }
      );
    });

    const coordinates = `${position.coords.longitude},${position.coords.latitude}`;
    console.log('getLocationAsyncForRules(): coordinates =', coordinates);

    return coordinates;
  } catch (error) {
    console.error('getLocationAsyncForRules(): ERROR', error);
    throw error;
  }
};

/**
 * Calculates the distance between two geographical coordinates
 * using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first point in decimal degrees
 * @param {number} lon1 - Longitude of the first point in decimal degrees
 * @param {number} lat2 - Latitude of the second point in decimal degrees
 * @param {number} lon2 - Longitude of the second point in decimal degrees
 * @returns {number} - Distance between the two points in kilometers
 */
export function getDistanceLatLon(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Converts degrees to radians.
 *
 * @param {number} deg - Angle in degrees
 * @returns {number} - Angle in radians
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
