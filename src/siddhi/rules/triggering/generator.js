/**
 * Creates a triggering rule in Siddhi Query Language (SiddhiQL).
 * This function handles various context rule types, segregates them based on conditions (deny rules or not),
 * and constructs the final Siddhi rule query.
 *
 * @param {Object} triggeringRule - An object containing the triggering rule details.
 * @returns {Array} - An array containing the generated Siddhi rule query and an array of context rules that need to be denied.
 */
export function createTriggeringRule(triggeringRule) {
    console.log('Creating Triggering Rule');

    const contextRules = Object.values(triggeringRule.contextRules);
    const denyRules = triggeringRule.denyContextRule;

    // Clasificación de reglas
    const timeCalendar = [], locWeatherServer = [];
    const denyTimeCalendar = [], denyLocWeather = [];

    contextRules.forEach((rule, i) => {
        const isDeny = denyRules[i];
        const isTimeCalendar = rule.type === 'Time-Based' || rule.type === 'Calendar-Based';

        if (isDeny) {
            if (isTimeCalendar) {denyTimeCalendar.push(rule);}
            else {denyLocWeather.push(rule);}
        } else {
            if (isTimeCalendar) {timeCalendar.push(rule);}
            else if (['Location', 'Weather', 'Server-Based'].includes(rule.type)) {
                locWeatherServer.push(rule);
            }
        }
    });

    // We order it for consistency
    [timeCalendar, locWeatherServer, denyTimeCalendar, denyLocWeather].forEach(arr => {
        if (arr.length > 0) {arr.sort(order);}
    });

    // Construct form clause
    const fromClause = buildFromClause(timeCalendar, denyTimeCalendar, locWeatherServer, denyLocWeather);

    const ruleQuery =
        `@info(name='${triggeringRule.name}TR')\n` +
        `from ${fromClause}\n` +
        `select e0.contextId, '${triggeringRule.recommendationType}' as recommendation insert into Results;\n`;

    const denyCR = [...denyTimeCalendar, ...denyLocWeather];

    return [ruleQuery, denyCR];
}


// Auxiliary function to order object array by name field (used in createTriggeringRule())
function order(a, b) {
    return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
}

/**
 * Builds the 'from' clause for the Siddhi query by considering various context rules.
 *
 * @param {Array} timeBasedCalendarRules - Normal time/calendar rules.
 * @param {Array} denyTimeBasedCalendarRules - Denied time/calendar rules.
 * @param {Array} locationWeatherServerRules - Normal location/weather/server rules.
 * @param {Array} denyLocationWeatherRules - Denied location/weather rules.
 * @returns {string} - The 'from' clause for the Siddhi rule.
 */
function buildFromClause(timeRules, denyTimeRules, locRules, denyLocRules) {
    const normalRules = [...timeRules, ...locRules];
    const denyRules = [...denyTimeRules.map(r => ({ ...r, deny: true })), ...denyLocRules.map(r => ({ ...r, deny: true }))];
    const allRules = [...normalRules, ...denyRules];

    if (allRules.length === 0) {
        throw new Error('No context rules found to build Siddhi clause.');
    }

    // Primer evento (el disparador)
    const firstRule = allRules[0];
    let clause = `every e0 = ${firstRule.deny ? 'not' : ''}${firstRule.name} `;
    let eIndex = 1;

    for (let i = 1; i < allRules.length; i++) {
        const rule = allRules[i];
        clause += `-> every e${eIndex} = ${rule.deny ? 'not' : ''}${rule.name}[e0.contextId == e${eIndex}.contextId] `;
        eIndex++;
    }

    return clause.trim();
}


