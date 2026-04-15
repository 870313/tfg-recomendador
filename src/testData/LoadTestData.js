import contextData from './Contextv2.json';
import contextRulesData from './ContextRulesv2.json';
import exclusionSetsData from './ExclusionSets.json';
import activitiesData from './Activities.json';

export const getContextExamples = () => {
  console.log('getContextExamples');
  const allContexts = contextData.contexts;

  const firstContext = allContexts.find(
    (ctx) => ctx.UserContext?.contextId === '0'
  );

  if (!firstContext) {
    console.warn('No context with ID 0 found.');
    return;
  }
  
  console.log('CONTEXT FIRST DATA:', JSON.stringify(firstContext));
  return firstContext;
};



export const getContextRulesExamples = () => {
  console.log('getContextRulesExamples');
  const data = contextRulesData.CR;
  console.log('CONTEXT RULE FIRST DATA:', JSON.stringify(data[0]));
  return data;
};

export const getExclusionSetsExamples = () => {
  console.log('getExclusionSetsExamples');
  const data = exclusionSetsData.ES;
  console.log('CONTEXT EXCLUSION SET DATA:', JSON.stringify(data[0]));
  return data;
};

export const getActivitiesExamples = () => {
  console.log('getActivitiesExamples');
  const data = activitiesData.activities;
  console.log('ACTIVITY FIRST DATA:', JSON.stringify(data[0]));
  return data;
};
