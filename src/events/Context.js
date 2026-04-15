import * as Schemas from '../realmSchemas/RealmServices';
import * as Location from './Position';
/**
 * Adds location information to the context, optionally adding noise if accuracy is disabled
 */
const buildLocation = (json, location, accuracy) => {
  // Parse the location JSON string
  const parsedLocation = JSON.parse(location);

  // Extract coordinates
  let { longitude: lon, latitude: lat } = parsedLocation.coords;

  // Add noise to coordinates if accuracy is disabled
  if (!accuracy) {
    const coords = Location.noiseCoordinate(lon, lat);
    lon = coords.lon;
    lat = coords.lat;
  }

  // Build the location object to add
  const locationData = {
    mocked: parsedLocation.mocked,
    speed: parsedLocation.coords.speed,
    altitude: parsedLocation.coords.altitude,
    longitude: lon,
    latitude: lat,
  };

  // Attach location data to the context
  json.context.location = locationData;
};


/**
 * Adds weather information to the context
 */
const buildWeather = (json, weather, includeExtraFields = false) => {
  // Parse the weather JSON string
  const parsedWeather = JSON.parse(weather);

  // Create basic weather object
  json.context.weather = {
    temp: parsedWeather.main.temp,
    description: parsedWeather.weather[0].main,
  };

  // Optionally add extra fields
  if (includeExtraFields) {
    Object.assign(json.context.weather, {
      pressure: parsedWeather.main.pressure,
      humidity: parsedWeather.main.humidity,
      temp_min: parsedWeather.main.temp_min,
      temp_max: parsedWeather.main.temp_max,
      wind: parsedWeather.wind.speed,
    });
  }
};

/**
 * Adds calendar events to the context
 * @param {Object} json - The context JSON object to update
 * @param {string} events - JSON string representing the list of events
 */
const buildEvents = (json, events) => {
  // Parse the events JSON string
  const parsedEvents = JSON.parse(events);

  // Map each parsed event to a cleaned event object
  json.context.events = parsedEvents.map((element) => {
    const calendar = checkTitle(element.calendar.title);

    return {
      description: element.description,
      calendar,
      title: element.title,
      begin: element.startDate,
      end: element.endDate,
      allDay: element.allDay,
      location: element.location,
      availability: element.availability,
    };
  });
};

/**
 * Checks if a title is an email address.
 * If it is, returns "NOT AVAILABLE", otherwise returns the original title.
 * @param {string} title - The event title to check
 * @returns {string} - Cleaned title
 */
const checkTitle = (title) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedTitle = title?.toLowerCase() || '';
  return emailRegex.test(normalizedTitle) ? 'NOT AVAILABLE' : title;
};


/**
 * Checks user's privacy settings to decide which information will be shared
 */
const buildContextAux = (user, location, weather, events) => {
  // Get current timestamp
  const datetime = new Date().toISOString();

  // Initialize the context object
  const json = {
    context: { timestamp: datetime },
  };

  const userId = user.token;

  // Add location information if permitted
  if (Schemas.retrieveValueSetting(userId, 'PROFILE', 'Location')) {
    const accuracy = Schemas.retrieveValueSetting(userId, 'PROFILE', 'Accurate Location');
    buildLocation(json, location, accuracy);
  }

  // Add weather information if permitted
  if (Schemas.retrieveValueSetting(userId, 'PROFILE', 'Weather')) {
    buildWeather(json, weather);
  }

  // Add calendar events information if permitted
  if (Schemas.retrieveValueSetting(userId, 'PROFILE', 'Calendar events')) {
    buildEvents(json, events);
  }

  return json;
};

// Builds the context information based on user's data
const buildContext = (user) => {
  // Retrieve additional context information
  const weather = Schemas.retrieveContext('WEATHER');
  const location = Schemas.retrieveContext('LOCATION');
  const events = Schemas.retrieveContext('EVENTS');

  // Build the full context object
  return buildContextAux(user, location.json, weather.json, events.json);
};


/**
 * Builds a user object with profile info based on user permission
 * @param {Object} userObj - The user object containing user information
 * @returns {Object} - The user object with the ID and possible profile info
 */
const buildUser = (userObj) => {
  const { token } = userObj; // Destructure token from userObj

  // Retrieve permission to access user profile
  const permission = Schemas.retrieveValueSetting(token, 'PROFILE', 'User profile');

  // Initialize the user object with the token as ID
  const user = { id: token };

  // If permission is granted, you can add personal info here
  if (permission) {
    // You can add code to retrieve personal info when needed
    // For example:
    // user.profile = retrieveUserProfileInfo(token);
  }

  return user;
};

/**
 * Builds an activity JSON object to be sent with validation and consistency checks
 * @param {Object} activity - The activity object containing activity data
 * @returns {Object} - The activity JSON object
 */
const buildActivity = (activity) => {
  // Destructuring the activity properties for cleaner access
  const {
    id,
    title,
    description,
    authorId,
    author,
    img,
    category,
    begin,
    end,
    longitude,
    latitude,
  } = activity;

  // Validate required fields and provide default values if missing
  if (!id || !title || !authorId || !author) {
    throw new Error('Missing required fields: id, title, authorId, or author.');
  }

  // Returning the activity JSON object
  return {
    id,
    title,
    description: description || 'No description provided', // Default value if missing
    authorId,
    author,
    img: img || '',      // Default empty string if img is missing
    category: category || 'General', // Default value for category
    begin,
    end,
    longitude,
    latitude,
  };
};

/**
 * Builds feedback-specific values from user-activity with validation
 * @param {Object} activity - The activity object containing feedback data
 * @param {Object} json - The existing JSON object to populate with feedback values
 * @returns {Object} - The updated JSON object with feedback values
 */
const buildFeedbackValues = (activity, json) => {
  // Validate required fields
  if (!activity) {
    throw new Error('Activity object is required.');
  }

  // Add 'clicked' feedback value
  json.clicked = activity.clicked;

  // Add 'saved' feedback value with conditional logic
  json.saved = activity.state === 'saved';

  // Add 'discarded' feedback value
  json.discarded = activity.discarded;

  // Add 'rating' feedback value
  json.rating = activity.rating;

  // Return the updated JSON object with feedback values
  return json;
};

/**
 * Builds the final feedback message including user, activity, and context information
 */
export const buildFeedbackMessage = (activity) => {
  // Retrieve current user
  const user = Schemas.retrieveUser();

  // Build the full feedback context
  const context = {
    ...buildContext(user),
    user: buildUser(user),
    activity: buildActivity(activity),
  };

  // Add feedback-specific values and return
  return buildFeedbackValues(activity, context);
};

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first point in decimal degrees.
 * @param {number} lon1 - Longitude of the first point in decimal degrees.
 * @param {number} lat2 - Latitude of the second point in decimal degrees.
 * @param {number} lon2 - Longitude of the second point in decimal degrees.
 * @returns {number} Distance between the two points in kilometers.
 */
function distanceBetweenCoords(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers

  // Converts numeric degrees to radians
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Builds Siddhi-compatible location observations from the current position.
 *
 * It compares the user's current coordinates with all location-based context rules (CRs),
 * calculates the distance to each predefined location in meters, and creates an observation
 * object for each location.
 *
 * @param {Object} pos - The current position object containing GPS coordinates.
 * @param {Object} pos.coords - The coordinates object.
 * @param {number} pos.coords.latitude - The user's current latitude.
 * @param {number} pos.coords.longitude - The user's current longitude.
 * @returns {Array<Object>} An array of observation objects for Siddhi context input.
 */
function buildLocationSiddhiContext(pos) {
  const lat1 = pos.coords.latitude;
  const lon1 = pos.coords.longitude;

  const locationCR = Schemas.retrieveLocationCR();
  const locationObservations = [];

  if (locationCR != null) {
    locationCR.forEach(element => {
      const distanceKM = distanceBetweenCoords(lat1, lon1, element.gpsLatitude, element.gpsLongitude);
      const distanceM = Math.round(distanceKM * 1000); // Convert to meters

      const observation = {
        observedProperty: 'Location',
        optionalField: element.name,
        observationValue: distanceM.toString(),
      };

      locationObservations.push(observation);
    });
  }

  return locationObservations;
}

/**
 * Builds a Siddhi-compatible weather observation from the OpenWeatherMap API response.
 *
 * Extracts the weather status (e.g., "Rain", "Clear") and temperature, and returns
 * a single observation object formatted for Siddhi context input.
 *
 * @param {Object} weather - The weather response object from OpenWeatherMap.
 * @param {Array<Object>} weather.weather - Array containing weather condition(s).
 * @param {string} weather.weather[0].main - Main weather condition.
 * @param {Object} weather.main - Object containing main weather metrics.
 * @param {number} weather.main.temp - Temperature in degrees (unit depends on request).
 * @returns {Array<Object>} An array with a single observation object.
 */
function buildWeatherSiddhiContext(weather) {
  const weatherStatus = weather.weather[0].main;
  const temp = weather.main.temp;

  const observation = {
    observedProperty: 'Weather',
    optionalField: temp.toString(),
    observationValue: weatherStatus,
  };

  return [observation];
}

/**
 * Builds a Siddhi-compatible context from the Sensorizar server response.
 *
 * Parses the JSON string and extracts environmental sensor data like CO2, temperature,
 * and humidity, returning them as separate observation objects.
 *
 * @param {string} sensorizar - A JSON string containing sensor readings from Sensorizar.
 * @returns {Array<Object>} An array of observation objects for CO2, Temperature, and Humidity.
 */
function buildServerBasedSiddhiContext(sensorizar) {
  console.log(`SENSORIZAR: ${JSON.stringify(sensorizar)}`);
  console.log(`SENSORIZAR OBJECT: ${typeof sensorizar}`);

  const object = JSON.parse(sensorizar);

  const observation1 = {
    observedProperty: 'CO2',
    optionalField: object.co2[0].value,
    observationValue: 'sensorizar',
  };

  const observation2 = {
    observedProperty: 'Temperature',
    optionalField: object.temperature[0].value,
    observationValue: 'sensorizar',
  };

  const observation3 = {
    observedProperty: 'Humidity',
    optionalField: object.humidity[0].value,
    observationValue: 'sensorizar',
  };

  return [observation1, observation2, observation3];
}

/**
 * Builds a Siddhi-compatible context object for testing purposes.
 *
 * It retrieves the last stored contextual data for LOCATION, WEATHER, and SENSORIZAR,
 * then parses and converts them into Siddhi-compatible observations. Finally, it composes
 * the user context and all observations into a single object.
 *
 * @param {Object} userContext - An object containing user-specific context values.
 * @returns {Object} A structured context object with user context and observations array.
 */
export function buildSiddhiContextForTest(userContext) {
  console.log('buildSiddhiContext');

  // Retrieve the latest saved contexts from local database
  const location = Schemas.retrieveLastContext('LOCATION');
  const weather = Schemas.retrieveLastContext('WEATHER');
  const sensorizar = Schemas.retrieveLastContext('SENSORIZAR');

  // Convert JSON strings to observation arrays
  const locationObservations = buildLocationSiddhiContext(JSON.parse(location.json));
  const weatherObservation = buildWeatherSiddhiContext(JSON.parse(weather.json));
  const sensorizarObservations = buildServerBasedSiddhiContext(sensorizar.json);

  // Combine all observations
  let observations = weatherObservation.concat(locationObservations);
  observations = observations.concat(sensorizarObservations);

  // Build final context object
  const context = {
    UserContext: userContext,
    Observations: observations,
  };

  console.log(`[NEW] Context: ${JSON.stringify(context)}`);
  return context;
}

/**
 * Builds a greeting message object containing user profile and settings.
 *
 * Retrieves user token and profile-related settings such as location,
 * location accuracy, weather, and calendar events from the Schemas module.
 *
 * @returns {Object} A message object with user token and settings.
 */
export function buildHelloMessage() {
  // Retrieve the current user's token
  let token = Schemas.retrieveUser().token;

  // Retrieve user profile setting using the token
  let user = Schemas.retrieveValueSetting(token, 'PROFILE', 'User profile');

  // Retrieve location setting
  let location = Schemas.retrieveValueSetting(token, 'PROFILE', 'Location');

  // Initialize accuracy to false by default
  let accuracy = false;

  if (location) {
    // If location is enabled, retrieve accuracy setting
    accuracy = Schemas.retrieveValueSetting(token, 'PROFILE', 'Accurate Location');
  }

  // Retrieve weather setting
  let weather = Schemas.retrieveValueSetting(token, 'PROFILE', 'Weather');

  // Retrieve calendar events setting
  let calendar = Schemas.retrieveValueSetting(token, 'PROFILE', 'Calendar events');

  // Construct the message object with all retrieved data
  let message = {
    user: token,
    settings: {
      user: user,
      location: {
        setting: location,
        accuracy: accuracy,
      },
      weather: weather,
      calendar: calendar,
    },
  };

  // Log the constructed message for debugging
  console.log(message);

  // Return the constructed message object
  return message;
}

/**
 * Builds a recommendation message by combining user context, location,
 * weather, and events with the list of recommendation categories.
 *
 * @param {Array<string>} recommendations - The recommendation categories to include.
 * @param {Object} weather - Weather information for the current context.
 * @param {Object} location - Location information (e.g., coordinates or address).
 * @param {Array<Object>} events - A list of events relevant to the user.
 * @returns {Object} The complete context-aware recommendation message.
 */
export function buildRecommendationMessage(recommendations, weather, location, events) {
  // Retrieve current user information from persistent storage
  const user = Schemas.retrieveUser();

  // Build contextual data (user, location, weather, events)
  const context = buildContextAux(user, location, weather, events);
  console.log('Context:', JSON.stringify(context));

  // Add recommendation categories
  context.categories = recommendations;

  // Specify the recommendation algorithm used
  context.recommender = 'mahout';

  // Add full user details to the message
  context.user = buildUser(user);

  return context;
}
