// realmSchemas.js - Modernized for React Native 0.79+ and Realm v10+
import Realm from 'realm';

// ------------------------- MODELS AS CLASSES -------------------------

/**
 * Stores the user's geographic position
 */
export class Position extends Realm.Object {
  static schema = {
    name: 'Position',
    properties: {
      userId: 'string',
      lat: 'double',
      lon: 'double',
      timestamp: 'int',
    },
  };
}

/**
 * Stores boolean configuration settings per user
 */
export class Setting extends Realm.Object {
  static schema = {
    name: 'Setting',
    properties: {
      userId: 'string',
      type: 'string',   // [ SETTINGS | PROFILE | ORDER ]
      key: 'string',
      value: 'bool',
    },
  };
}

/**
 * Stores an activity with metadata
 */
export class Activity extends Realm.Object {
  static schema = {
    name: 'Activity',
    primaryKey: 'id',
    properties: {
      id: 'string',             // artificial key
      authorId: 'string',       // Entity Management (EM) author ID
      author: 'string',         // Author's name or title
      title: 'string',
      type: 'string',
      description: 'string',
      img: 'string?',           // optional image URL
      begin: 'date?',           // optional start date
      ending: 'date?',          // optional end date
      longitude: 'double?',     // optional location
      latitude: 'double?',
      rating: { type: 'int', default: 0 },
      state: { type: 'string', default: 'default' },
      user: 'string',           // user who received the activity
      clicked: { type: 'bool', default: false },
      discarded: { type: 'bool', default: false },
      date: 'date?',             // creation or last update
    },
  };
}

/**
 * Stores basic user information
 */
export class User extends Realm.Object {
  static schema = {
    name: 'User',
    primaryKey: 'name',
    properties: {
      name: 'string',
      token: 'string?',         // optional client-side token
      authToken: 'string',
      password: 'string?',      // optional (for local auth)
      provider: 'string',       // [ FACEBOOK | GOOGLE | ... ]
      genre: 'string',
      birth: 'string',
    },
  };
}

/**
 * Stores raw JSON for different contexts
 */
export class JSONRecord extends Realm.Object {
  static schema = {
    name: 'JSON',
    properties: {
      id: 'int',
      key: 'string',   // [WEATHER | LOCATION | SENSORIZAR]
      json: 'string',
    },
  };
}

/**
 * Stores string settings (unlike Setting which stores bool)
 */
export class Parameter extends Realm.Object {
  static schema = {
    name: 'Parameter',
    properties: {
      userId: 'string',
      type: 'string',    // [ SETTINGS | PROFILE | ORDER ]
      key: 'string',
      value: 'string',
    },
  };
}

/**
 * Embedded key-value structure for boolean selections
 */
export class KeyBool extends Realm.Object {
  static schema = {
    name: 'KeyBool',
    embedded: true,             // embedded object
    properties: {
      key: 'string',
      checked: 'bool',
    },
  };
}

/**
 * Rule for defining context (location, time, conditions)
 */
export class ContextRule extends Realm.Object {
  static schema = {
    name: 'ContextRule',
    primaryKey: 'id',
    properties: {
      id: 'int',
      type: 'string',
      name: 'string',
      gpsLatitude: 'double?',
      gpsLongitude: 'double?',
      locationError: 'int?',
      startTime: 'string?',
      endTime: 'string?',
      daysOfWeek: 'KeyBool[]',    // array of KeyBool for weekday rules
      startDate: 'string?',
      endDate: 'string?',
      weatherStatus: 'KeyBool[]', // array of KeyBool for weather conditions
      minTemp: 'int?',
      maxTemp: 'int?',
      server: 'string?',
      measurement: 'string?',
      comparator: 'string?',
      value: 'float?',
      // Inverse relationship with TriggeringRule.contextRules
      triggeringRules: {
        type: 'linkingObjects',
        objectType: 'TriggeringRule',
        property: 'contextRules',
      },
    },
  };
}

/**
 * Rule for triggering actions based on context
 */
export class TriggeringRule extends Realm.Object {
  static schema = {
    name: 'TriggeringRule',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      recommendationType: 'string',
      switchState: 'bool',
      contextRules: 'ContextRule[]',
      denyContextRule: 'bool[]',      // denies based on rule index
    },
  };
}

/**
 * Represents a set of exclusions by recommendation type
 */
export class ExclusionSet extends Realm.Object {
  static schema = {
    name: 'ExclusionSet',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      pos: 'int',
      recommendationType: 'string[]', // array of recommendation types
    },
  };
}

/**
 * Token storage (e.g. for sensor data access)
 */
export class Token extends Realm.Object {
  static schema = {
    name: 'Token',
    primaryKey: 'id',
    properties: {
      id: 'int',
      token: 'string?',        // optional token for external services
      provider: 'string',
      timestamp: 'date',
    },
  };
}
