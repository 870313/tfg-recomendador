// Auxiliary function to order object array by name field (used in createTriggeringRule())
function order(a, b) {
    return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
}

// Main entry point to generate all negated context rules
export function createNegatedContextRules(denyCR) {
    const notRepeated = [...new Map(denyCR.map(item => [item.id, item])).values()];
    notRepeated.sort(order);

    return notRepeated.map(createDenyContextRule).join('\n');
}

const {
    createDenyTimeBasedContextRule,
    createDenyCalendarBasedContextRule,
    createDenyWeatherContextRule,
    createDenyLocationContextRule,
    createDenyServerBasedContextRule,
} = require('./generator');

/**
 * Generates a Siddhi rule for a negated (deny) context rule based on its type.
 *
 * This function acts as a dispatcher to delegate the creation of the appropriate
 * Siddhi rule for a given "deny" context rule, depending on its semantic type.
 *
 * @param {Object} denyCR - The context rule object to be negated.
 * @param {string} denyCR.type - The type of the context rule ("Time-Based", "Calendar-Based", etc.).
 * @returns {string} The Siddhi query string representing the negated context rule.
 * @throws {Error} If the context rule type is not recognized.
 */
function createDenyContextRule(denyCR) {
    switch (denyCR.type) {
        case 'Time-Based':
            return createDenyTimeBasedContextRule(denyCR); // Negates a time-based rule
        case 'Calendar-Based':
            return createDenyCalendarBasedContextRule(denyCR); // Negates a calendar-based rule
        case 'Weather':
            return createDenyWeatherContextRule(denyCR); // Negates a weather-based rule
        case 'Location':
            return createDenyLocationContextRule(denyCR); // Negates a location-based rule
        case 'Server-Based':
            return createDenyServerBasedContextRule(denyCR); // Negates a server-based rule
        default:
            throw new Error(`Unsupported context rule type: ${denyCR.type}`); // Error for unknown rule types
    }
}

