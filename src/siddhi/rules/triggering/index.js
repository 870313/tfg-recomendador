import {createTriggeringRule} from './generator';
import {createNegatedContextRules} from '../negatedContext/index';

/**
 * Generates all triggering rules in Siddhi Query Language (SiddhiQL).
 * It processes each triggering rule, creates the respective SiddhiQL for them,
 * and adds context rules that should be denied (negated context rules).
 *
 * @param {Array} triggeringRules - Array of triggering rule objects, where each object contains information
 *                                  about the rule and context rules to be denied.
 * @returns {string} The complete SiddhiQL query string consisting of denied context rules followed by triggering rules.
 */
export function writeAllTriggeringRules(triggeringRules) {
    let result = ''; // Initialize the resulting query string
    let denyRules = []; // Array to hold denied context rules

    // Iterate over each triggering rule
    triggeringRules.forEach(element => {
      // Log triggering rule details for debugging
      console.log(`[NEW] -> TR: ${element.name} ${element.denyContextRule}`);

      // Create the triggering rule and add it to the result string
      let rule = createTriggeringRule(element);
      result += rule[0]; // Add the generated triggering rule to the result

      // Collect any context rules that should be denied
      rule[1].forEach(e => denyRules.push(e));
    });

    // Generate the negated context rules
    const denyCR = createNegatedContextRules(denyRules);

    // Log denied context rules and triggering rules for debugging
    console.log('DENIED CONTEXT RULES:', denyCR);
    console.log('TRIGGERING RULES:', result);

    // Return the denied context rules first, followed by the triggering rules
    return denyCR + result;
}
