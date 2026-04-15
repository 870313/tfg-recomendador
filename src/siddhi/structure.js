const siddhiAppName = 'siddhiApp';

/**
 * Generates the header of the Siddhi App:
 * - App name declaration
 * - Stream definitions
 * - Initial queries to parse incoming JSON
 */
export function createSiddhiAppIntro() {
  const appDeclaration = `@App:name('${siddhiAppName}')\n`;

  const streams = `
define stream Context (json string);
define stream UserContext(contextId string, date string, time string);
define stream Observations(observedProperty string, optionalField string, observationValue string, contextId string);
define stream Results(contextId string, recommendation string);

@sink(type = 'log', prefix = 'LOGGER_FinalResult') define stream FinalResults(contextId string, recommendation string);
@sink(type = 'log', prefix = 'LOGGER_Je') define stream Je(contextId string);
@sink(type = 'log', prefix = 'LOGGER_Fes') define stream Fes(contextId string);
`;

  const introQueries = `
@info(name = 'getUserContext')
from Context
select
  json:getString(json, '$.UserContext.contextId') as contextId,
  json:getString(json, '$.UserContext.date') as date,
  json:getString(json, '$.UserContext.time') as time
insert into UserContext;

@info(name = 'getObservations')
from Context#json:tokenizeAsObject(json, '$.Observations')
select
  json:getString(jsonElement, '$.observedProperty') as observedProperty,
  json:getString(jsonElement, '$.optionalField') as optionalField,
  json:getString(jsonElement, '$.observationValue') as observationValue,
  json:getString(json, '$.UserContext.contextId') as contextId
insert into Observations;
`;

  return `${appDeclaration}${streams}${introQueries}`;
}

/**
 * Generates the final query block of the Siddhi App:
 * - Aggregates recommendations in time windows
 * - Outputs them to the FinalResults stream
 */
export function createSiddhiAppEnd() {
  return `
@info(name = 'finalResults')
from Results#window.timeBatch(7 sec)
select contextId, str:groupConcat(recommendation) as recommendation
group by contextId
insert into FinalResults;
`;
}
