import { createSiddhiAppIntro, createSiddhiAppEnd } from './structure.js';
import { writeAllContextRules } from './rules/context/index.js';
import { writeAllTriggeringRules } from './rules/triggering/index.js';

//Siddhi client
import { NativeModules } from 'react-native';
const { SiddhiClientModule } = NativeModules;

//Schemas and DB
import * as Schemas  from '../realmSchemas/RealmServices.js';

/**
 * Orchestrates the creation and launch of the Siddhi App.
 */
export async function createSiddhiApp() {
  console.log('[Siddhi] Starting createSiddhiApp');

  // Retrieve all triggering rules that are currently enabled
  const triggeringRules = Schemas.retrieveTriggeringRulesSwitchOn();
  console.log('[Siddhi] Triggering rules found:', triggeringRules);
  // Exit early if no triggering rules are found
  if (!triggeringRules || triggeringRules.length === 0) {
    console.log('[Siddhi] No triggering rules found. Stopping Siddhi App.');
    SiddhiClientModule.stopApp();
    return;
  }

  try {
    // Retrieve all context rules from the database
    const contextRules = Schemas.retrieveContextRules();

    // Compose the Siddhi App as a full string
    const siddhiAppDefinition = [
      createSiddhiAppIntro(),                         // App header and input streams
      writeAllContextRules(contextRules),             // Rules that define context conditions
      writeAllTriggeringRules(triggeringRules),       // Rules that define when to trigger recommendations
      createSiddhiAppEnd(),                            // Final aggregation and output stream
    ].join('\n');

    // Debug logging
    console.log('[Siddhi] Generated Siddhi App:\n', siddhiAppDefinition);

    // Restart the Siddhi App with new definition
    SiddhiClientModule.stopApp();
    SiddhiClientModule.startApp(siddhiAppDefinition);

    console.log('[Siddhi] Siddhi App started successfully.');
  } catch (error) {
    console.error('[Siddhi] Error while creating Siddhi App:', error);
  }
}
