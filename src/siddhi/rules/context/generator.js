/**
 * Generates a time-based context rule in Siddhi Query Language (SiddhiQL).
 * The rule triggers based on time differences within a specific range.
 *
 * @param {Object} contextRule - The context rule object containing details like name, start time, and end time.
 * @returns {string} SiddhiQL string representing the time-based context rule.
 */
export function createTimeBasedContextRule(contextRule) {
    // Define the base structure of the rule
    const ini = "@info(name='";
    const from = "') from UserContext[((time:timestampInMilliseconds(time, 'HH:mm:ss') - time:timestampInMilliseconds('";
    const from2 = ":00', 'HH:mm:ss')) >= 0) and ((time:timestampInMilliseconds(time, 'HH:mm:ss') - time:timestampInMilliseconds('";
    const select = ":00', 'HH:mm:ss')) < 0)] select contextId insert into ";
    const ending = ';\n';

    // Concatenate rule components to form the full SiddhiQL string
    const result = ini + contextRule.name + 'CR' + from + contextRule.startTime + from2 + contextRule.endTime
                  + select + contextRule.name + ending;

    return result;
}

/**
 * Generates a calendar-based context rule in Siddhi Query Language (SiddhiQL).
 * The rule triggers based on specific days of the week and optionally within a date range.
 *
 * @param {Object} contextRule - The context rule object containing details like name, days of the week, and date range.
 * @returns {string} SiddhiQL string representing the calendar-based context rule.
 */
export function createCalendarBasedContextRule(contextRule) {
  const { name, daysOfWeek, startDate, endDate } = contextRule;

  const ruleName = `${name}CR`;
  const streamName = name;

  // Filter days selected
  const selectedDays = daysOfWeek.filter(day => day.checked).map(day => `'${day.key}'`);

  // If there are no days selected return an error
  if (selectedDays.length === 0) {
    return `// ERROR: No days selected for rule "${ruleName}"`;
  }

  // Construct the conditions
  const dayCondition = selectedDays.length === 1
    ? `time:dayOfWeek(date, 'dd/MM/yyyy') == ${selectedDays[0]}`
    : `(${selectedDays.map(d => `time:dayOfWeek(date, 'dd/MM/yyyy') == ${d}`).join(' or ')})`;

  // Date conditions if it corresponds
  let dateRangeCondition = '';
  const validDates = startDate !== '__/__/__' && endDate !== '__/__/__';
  if (validDates) {
    dateRangeCondition =
      ` and time:dateDiff(date, '${startDate}', 'dd/MM/yyyy', 'dd/MM/yyyy') >= 0` +
      ` and time:dateDiff(date, '${endDate}', 'dd/MM/yyyy', 'dd/MM/yyyy') <= 0`;
  }

  // Final query construction
  const query = `
@info(name='${ruleName}')
from UserContext[
  ${dayCondition}${dateRangeCondition}
]
select contextId
insert into ${streamName};
  `;

  return query.trim();
}


/**
 * Generates a weather-based context rule in Siddhi Query Language (SiddhiQL).
 * The rule triggers based on specific weather status and observation value,
 * and filters by a temperature range (optional).
 *
 * @param {Object} contextRule - The context rule object containing details like name, weather status, and temperature range.
 * @returns {string} SiddhiQL string representing the weather-based context rule.
 */
export function createWeatherContextRule(contextRule) {
  const { name, weatherStatus, minTemp, maxTemp } = contextRule;

  const ruleName = `${name}CR`;
  const streamName = name;

  // Filter meteologic conditions selected
  const selectedWeather = weatherStatus.filter(w => w.checked).map(w => `'${w.key}'`);

  if (selectedWeather.length === 0) {
    return `// ERROR: No weather conditions selected for rule "${ruleName}"`;
  }

  // Constuct condition for observationValue
  const weatherCondition = selectedWeather.length === 1
    ? `observationValue == ${selectedWeather[0]}`
    : `(${selectedWeather.map(w => `observationValue == ${w}`).join(' or ')})`;

  // Validate temeprature
  const min = typeof minTemp === 'number' ? minTemp : parseFloat(minTemp);
  const max = typeof maxTemp === 'number' ? maxTemp : parseFloat(maxTemp);

  if (isNaN(min) || isNaN(max)) {
    return `// ERROR: Invalid temperature range in rule "${ruleName}"`;
  }

  const query = `
@info(name='${ruleName}')
from Observations[
  observedProperty == 'Weather' and
  ${weatherCondition} and
  convert(optionalField, 'double') >= ${min} and
  convert(optionalField, 'double') <= ${max}
]
select contextId as contextId
insert into ${streamName};
  `;

  return query.trim();
}


/**
 * Generates a location-based context rule in Siddhi Query Language (SiddhiQL).
 * The rule triggers based on the location observation and checks for a specified location error range.
 *
 * @param {Object} contextRule - The context rule object containing details like name, location error, and observation value.
 * @returns {string} SiddhiQL string representing the location-based context rule.
 */
export function createLocationContextRule(contextRule) {
    // Define the base structure of the rule
    let ini = "@info(name='";
    let from = "') from Observations[observedProperty == 'Location' and optionalField == '";
    let from2 = "' and convert(observationValue, 'int') <= ";

    // Define the 'select' and 'insert into' clauses
    const select = '] select contextId insert into ';
    const ending = ';\n';

    // Construct the complete rule
    const result = ini + contextRule.name + 'CR' + from + contextRule.name + from2 + contextRule.locationError + select + contextRule.name + ending;

    return result;
}

/**
 * Generates a server-based context rule in Siddhi Query Language (SiddhiQL).
 * The rule is based on sensor measurements (e.g., temperature, CO2, humidity) and compares a value
 * with the provided threshold, generating a rule for server-based context triggers.
 *
 * @param {Object} contextRule - The context rule object containing details like name, measurement,
 *                               server value, comparator, and threshold value.
 * @returns {string} SiddhiQL string representing the server-based context rule.
 */
export function createServerBasedContextRule(contextRule) {
    // Determine the type based on the measurement
    let type;
    switch (contextRule.measurement) {
      case 'temperature':
        type = 'Temperature';
        break;
      case 'co2':
        type = 'CO2';
        break;
      case 'humidity':
        type = 'Humidity';
        break;
      default:
        throw new Error(`[ERROR] Unsupported measurement type: ${contextRule.measurement}`);
    }

    // Log the creation of a new rule for debugging purposes
    console.log(`[NEW] -> CR : ${contextRule.name} | ${type}`);

    // Build the rule string
    let ini = "@info(name='";
    let from = `') from Observations[(observedProperty=='${type}') and (observationValue=='${contextRule.server}') and ((convert(optionalField, 'double') ${contextRule.comparator} ${contextRule.value}))]`;
    let select = `select contextId insert into ${contextRule.name};\n`;

    // Construct the full rule string
    let result = ini + contextRule.name + 'CR' + from + select;

    // Log the generated rule for debugging
    console.log(`[NEW] -> CR : ${result}`);

    return result;
}

