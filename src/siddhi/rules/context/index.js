import {
    createTimeBasedContextRule,
    createCalendarBasedContextRule,
    createWeatherContextRule,
    createLocationContextRule,
    createServerBasedContextRule,
  } from './generator';

/**
 * Aggregates all context rules into Siddhi Query Language (SiddhiQL) syntax.
 * Each rule is converted based on its type using the corresponding generator.
 *
 * @param {Array} contextRules - List of context rule objects from the database.
 * @returns {string} SiddhiQL string containing all context rules.
 */
export function writeAllContextRules(contextRules = []) {
  return contextRules.map(rule => {
    switch (rule.type) {
      case 'Time-Based':
        return createTimeBasedContextRule(rule);
      case 'Calendar-Based':
        return createCalendarBasedContextRule(rule);
      case 'Weather':
        return createWeatherContextRule(rule);
      case 'Location':
        return createLocationContextRule(rule);
      case 'Server-Based':
        return createServerBasedContextRule(rule);
      default:
        console.warn('[Siddhi] Unknown context rule type:', rule.type);
        return '';
    }
  }).join('\n');
}
