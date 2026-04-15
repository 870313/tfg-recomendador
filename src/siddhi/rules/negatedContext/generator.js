/**
 * Generates a Siddhi rule that negates a time-based context rule.
 *
 * The generated rule checks whether the current time does *not* fall within a given
 * time interval defined by `startTime` and `endTime`. It compares the current system time
 * with the interval, and inserts the context ID into a "not" stream if the time is outside.
 *
 * @param {Object} denyCR - The time-based context rule to be negated.
 * @param {string} denyCR.name - The name of the context rule.
 * @param {string} denyCR.startTime - The start time of the valid interval (format: 'HH:mm').
 * @param {string} denyCR.endTime - The end time of the valid interval (format: 'HH:mm').
 * @returns {string} The Siddhi query string representing the negated rule.
 */
export function createDenyTimeBasedContextRule(denyCR) {
    const ini = "@info(name='not";

    // Create a condition that triggers when time is outside [startTime, endTime)
    const from = "') from UserContext[((time:timestampInMilliseconds(time, 'HH:mm:ss') - time:timestampInMilliseconds('";
    const from2 = ":00', 'HH:mm:ss')) < 0) or ((time:timestampInMilliseconds(time, 'HH:mm:ss') - time:timestampInMilliseconds('";

    const select = ":00', 'HH:mm:ss')) >= 0)] select contextId insert into not";
    const ending = ';\n';

    // Compose the final Siddhi rule string
    const result = ini + denyCR.name + 'CR' + from + denyCR.startTime + from2 + denyCR.endTime
                 + select + denyCR.name + ending;

    return result;
}

/**
 * Generates a Siddhi rule that negates a calendar-based context rule.
 *
 * This rule triggers when the current day is *not* one of the specified days of the week
 * and/or the date is *outside* the valid date interval.
 *
 * @param {Object} denyCR - The calendar-based context rule to negate.
 * @param {string} denyCR.name - The name of the context rule.
 * @param {Array} denyCR.daysOfWeek - Array of days with { key, checked } format.
 * @param {string} denyCR.startDate - The starting valid date (format: 'dd/MM/yyyy').
 * @param {string} denyCR.endDate - The ending valid date (format: 'dd/MM/yyyy').
 * @returns {string} The Siddhi query string representing the negated rule.
 */
export function createDenyCalendarBasedContextRule(denyCR) {
    const name = denyCR.name;
    const selectedDays = denyCR.daysOfWeek.filter(day => day.checked).map(day => day.key);

    const daysCondition = selectedDays.length
      ? '(' + selectedDays.map(day => `time:dayOfWeek(date, 'dd/MM/yyyy') != '${day}'`).join(' and ') + ')'
      : ''; // If there are not days, we don't put this condition

    let dateCondition = '';
    if (denyCR.startDate !== '__/__/__' && denyCR.endDate !== '__/__/__') {
      dateCondition = `(time:dateDiff(date, '${denyCR.startDate}', 'dd/MM/yyyy', 'dd/MM/yyyy') < 0 or time:dateDiff(date, '${denyCR.endDate}', 'dd/MM/yyyy', 'dd/MM/yyyy') > 0)`;
    }

    // Combine in an or if both exist
    let condition = '';
    if (daysCondition && dateCondition) {
      condition = `${daysCondition} or ${dateCondition}`;
    } else if (daysCondition) {
      condition = daysCondition;
    } else if (dateCondition) {
      condition = dateCondition;
    } else {
      // No hay condiciones -> se generaría una regla inválida
      return `-- Rule '${name}' no generated: days not specified\n`;
    }

    const siddhiRule = `
  @info(name='not${name}CR') 
  from UserContext[${condition}] 
  select contextId as contextId 
  insert into not${name};
  `.trim();

    return siddhiRule;
  }


/**
 * Generates a Siddhi rule that negates a weather-based context rule.
 *
 * This rule triggers when the observed weather status is *not* among the allowed ones,
 * or when the temperature is *outside* the allowed range.
 *
 * @param {Object} denyCR - The weather-based context rule to negate.
 * @param {string} denyCR.name - The name of the context rule.
 * @param {Array} denyCR.weatherStatus - Array of weather statuses with { key, checked } format.
 * @param {number} denyCR.minTemp - Minimum allowed temperature.
 * @param {number} denyCR.maxTemp - Maximum allowed temperature.
 * @returns {string} The Siddhi query string representing the negated rule.
 */
export function createDenyWeatherContextRule(denyCR) {
    const name = denyCR.name;
    const selectedWeather = denyCR.weatherStatus
      .filter(element => element.checked)
      .map(element => element.key);

    let weatherCondition = '';
    if (selectedWeather.length > 0) {
      weatherCondition =
        '(' +
        selectedWeather.map(w => `observationValue != '${w}'`).join(' and ') +
        ')';
    }

    const tempCondition = `(convert(optionalField, 'double') < ${denyCR.minTemp} or convert(optionalField, 'double') > ${denyCR.maxTemp})`;

    // Combine conditions
    let finalCondition = '';
    if (weatherCondition) {
      finalCondition = `(observedProperty == 'Weather') and (${weatherCondition} or ${tempCondition})`;
    } else {
      finalCondition = `(observedProperty == 'Weather') and ${tempCondition}`;
    }

    const siddhiRule = `
  @info(name='not${name}CR')
  from Observations[${finalCondition}]
  select contextId as contextId
  insert into not${name};
  `.trim();

    return siddhiRule;
  }


/**
 * Generates a Siddhi rule that negates a location-based context rule.
 *
 * This rule triggers when the location error (in meters) is greater than the allowed threshold.
 *
 * @param {Object} denyCR - The location-based context rule to negate.
 * @param {string} denyCR.name - The name of the context rule.
 * @param {number} denyCR.locationError - Maximum allowed location error.
 * @returns {string} The Siddhi query string representing the negated rule.
 */
export function createDenyLocationContextRule(denyCR) {
    const ini = "@info(name='not";
    const from = "') from Observations[observedProperty == 'Location' and optionalField == '";
    const from2 = "' and convert(observationValue, 'int') > ";
    const select = '] select contextId insert into not';
    const ending = ';\n';

    const result =
        ini + denyCR.name + 'CR' +
        from + denyCR.name +
        from2 + denyCR.locationError +
        select + denyCR.name +
        ending;

    return result;
}


/**
 * Generates a Siddhi rule that negates a server-based context rule.
 *
 * This rule triggers when a specific server measurement (temperature, CO2, humidity) violates the given condition.
 *
 * @param {Object} contextRule - The server-based context rule to negate.
 * @param {string} contextRule.name - The name of the context rule.
 * @param {string} contextRule.comparator - The comparator used for the condition (e.g., '>', '=', '<').
 * @param {string} contextRule.measurement - The type of measurement (e.g., 'temperature', 'co2', 'humidity').
 * @param {string} contextRule.server - The server name or ID associated with the context rule.
 * @param {number} contextRule.value - The value that the observation must meet or exceed based on the comparator.
 * @returns {string} The Siddhi query string representing the negated server-based rule.
 */
export function createDenyServerBasedContextRule(contextRule) {
    // Determine the negation sign based on the comparator
    let denySign;
    if (contextRule.comparator === '>') {denySign = '<=';}
    if (contextRule.comparator === '=') {denySign = '!=';}
    if (contextRule.comparator === '<') {denySign = '>=';}

    // Set the measurement type (Temperature, CO2, or Humidity)
    let type;
    if (contextRule.measurement === 'temperature') {type = 'Temperature';}
    if (contextRule.measurement === 'co2') {type = 'CO2';}
    if (contextRule.measurement === 'humidity') {type = 'Humidity';}

    console.log(`[NEW] -> CR : ${contextRule.name} | ${type}`);

    // Construct the Siddhi query
    const ini = "@info(name='not";
    const from = `') from Observations[(observedProperty=='${type}') and (observationValue=='${contextRule.server}') and ((convert(optionalField, 'double') ${denySign} ${contextRule.value}))]`;
    const select = `select contextId insert into not${contextRule.name};\n`;

    const result = ini + contextRule.name + 'CR' + from + select;

    console.log(`[NEW] -> CR : ${result}`);
    return result;
}
