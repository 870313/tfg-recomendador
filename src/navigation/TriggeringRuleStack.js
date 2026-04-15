import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Context rule screen
import AddTriggeringRule from '../screens/triggeringRules/AddTriggeringRule';
import EditTriggeringRule from '../screens/triggeringRules/EditTriggeringRule';
const Stack = createStackNavigator();
//This is a navigation stack just for the context rules screen
const TriggerinRuleStack = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen
        name="Define_Triggering_Rule"
        component={AddTriggeringRule}
        options={{ title: 'Define Triggering Rule' }}
      />

      <Stack.Screen
        name="Edit_Triggering_Rule"
        component={EditTriggeringRule}
        options={{ title: 'Edit Triggering Rule' }}
      />
    </Stack.Navigator>
  );
};

export default TriggerinRuleStack;
