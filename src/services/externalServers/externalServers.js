import * as ExternalRequests from './externalServers.json';
import oauth from '../../../oauth.json';
import * as Schemas from '../../realmSchemas/RealmServices';
/**
 * Logs in to the Sensorizar server by sending a predefined request.
 *
 * @async
 * @function loginSensorizarServer
 * @returns {Promise<string|undefined>} The authentication token if the login succeeds, or `undefined` on failure.
 */
export async function loginSensorizarServer() {
    console.log('[NEW] -> loginSensorizarServer');

    // Get server info for 'sensorizar'
    const sensorizarInfo = ExternalRequests.list.find((server) => server.name === 'sensorizar');
    if (!sensorizarInfo) {
      console.warn('[loginSensorizarServer] Sensorizar server not found in ExternalRequests.');
      return;
    }

    // Get login request details
    const loginRequest = sensorizarInfo.requests.find((r) => r.key === 'login');
    if (!loginRequest) {
      console.warn('[loginSensorizarServer] Login request not found for Sensorizar server.');
      return;
    }

    console.log(`[NEW] -> ${JSON.stringify(loginRequest)} | ${typeof loginRequest}`);

    const params = {
      method: loginRequest.requestType,
      headers: loginRequest.headers,
      body: JSON.stringify(loginRequest.body),
    };

    const url = `${sensorizarInfo.url}${loginRequest.route}`;

    try {
      const response = await fetch(url, params);
      const result = await response.json();

      console.log(`[NEW] -> RESPONSE: ${response.status} + ${result.token}`);

      // Store token in local database with timestamp
      Schemas.storeServerToken(result.token, 'sensorizar', new Date());

      return result.token;
    } catch (error) {
      console.error('[loginSensorizarServer] Error during login:', error);
    }
}

/**
 * Fetches context data from the Sensorizar server using a given authentication token.
 *
 * @async
 * @function getInfoServer
 * @param {string} token - The authentication token for the Sensorizar server.
 * @returns {Promise<Response|undefined>} The full fetch response if successful, or `undefined` on failure.
 */
export async function getInfoServer(token) {
    console.log('[NEW] -> getInfoSensorizarServer');

    // Get server configuration for 'sensorizar'
    const sensorizarInfo = ExternalRequests.list.find((server) => server.name === 'sensorizar');
    if (!sensorizarInfo) {
      console.warn('[getInfoServer] Sensorizar server not found in ExternalRequests.');
      return;
    }

    // Get request config for 'data' retrieval
    const getInfoRequest = sensorizarInfo.requests.find((r) => r.key === 'data');
    if (!getInfoRequest) {
      console.warn('[getInfoServer] Data request not found for Sensorizar server.');
      return;
    }

    console.log(`[NEW] -> ${JSON.stringify(getInfoRequest)} | ${typeof getInfoRequest}`);

    // Configure request parameters
    const params = {
      method: getInfoRequest.requestType,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Authorization': `Bearer ${token}`,
      },
    };

    // Construct the full URL using route and path parameters
    const url = `${sensorizarInfo.url}${getInfoRequest.route}${getInfoRequest.pathParams.ENTITY_VIEW}/${getInfoRequest.endRoute}`;

    console.log(`[NEW] -> URL ${url}`);

    try {
      const response = await fetch(url, params);
      const text = await response.text();

      console.log(`[NEW] -> RESPONSE: ${response.status} + ${text}`);

      // Store the response content in local context database
      Schemas.CreateContext('SENSORIZAR', JSON.stringify(text));

      return response;
    } catch (error) {
      console.error('[getInfoServer] Error while fetching data:', error);
    }
}

/**
 * Fetches weather data from the OpenWeatherMap API using fixed test coordinates.
 *
 * @async
 * @function getDataOpenWeatherMap
 * @returns {Promise<Response|undefined>} The fetch response if successful, or `undefined` if an error occurs.
 */
export async function getDataOpenWeatherMap() {
    console.log('[NEW] -> getDataOpenWeatherMap');

    // Retrieve the OpenWeatherMap server configuration
    const openWeatherInfo = ExternalRequests.list.find((server) => server.name === 'openweather');
    if (!openWeatherInfo) {
      console.warn('[getDataOpenWeatherMap] OpenWeatherMap server config not found.');
      return;
    }

    // Retrieve the request details for the 'weather' endpoint
    const weatherRequest = openWeatherInfo.requests.find((r) => r.key === 'weather');
    if (!weatherRequest) {
      console.warn('[getDataOpenWeatherMap] Weather request config not found.');
      return;
    }

    // Define query parameters
    const { lat, lon, units, appid: appidKey } = weatherRequest.queryParams;
    const testLat = '39.31';
    const testLon = '-74.5';
    const appid = oauth.openweathermap;

    // Construct the full URL
    const url = `${openWeatherInfo.url}${weatherRequest.route}${lat}${testLat}${lon}${testLon}${units}${appidKey}${appid}`;
    console.log(`[NEW] -> URL: ${url}`);

    try {
      // Perform the HTTP request
      const response = await fetch(url);
      console.log(`[NEW] -> RESPONSE STATUS: ${response.status}`);

      return response;
    } catch (error) {
      console.error('[getDataOpenWeatherMap] Failed to fetch weather data:', error);
    }
}
