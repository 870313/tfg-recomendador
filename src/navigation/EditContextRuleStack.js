// ~/R-Rules/MobileApp/src/navigation/EditContextRuleStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';


import EditLocationContextRuleScreen from '../screens/contextRules/EditLocationBasedContextRule';
import EditTimeBasedContextRuleScreen from '../screens/contextRules/EditTimeBasedContextRule';
import EditCalendarBasedContextRuleScreen from '../screens/contextRules/EditCalendarBasedContestRule';
import EditWeatherContextRuleScreen from '../screens/contextRules/EditWeatherBasedContextRule';
import EditServerBasedContextRuleScreen from '../screens/contextRules/EditServerBasedContextRule';
const Stack = createStackNavigator();

const EditContextRUleStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Edit_Location_Context_Rule" component={EditLocationContextRuleScreen}/>
      <Stack.Screen name="Edit_Time_Based_Context_Rule" component={EditTimeBasedContextRuleScreen}/>
      <Stack.Screen name="Edit_Calendar_Based_Context_Rule" component={EditCalendarBasedContextRuleScreen}/>
      <Stack.Screen name="Edit_Weather_Context_Rule" component={EditWeatherContextRuleScreen}/>
      <Stack.Screen name="Edit_Server_Based_Context_Rule" component={EditServerBasedContextRuleScreen}/>
    </Stack.Navigator>
  );
};


export default EditContextRUleStack;
