import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Context rule screen
import AddContextRuleScreen from '../screens/contextRules/AddContextRule';
const Stack = createStackNavigator();
//This is a navigation stack just for the context rules screen
const ContextRuleStack = () => {
  return (
    <Stack.Navigator initialRouteName="Define_context_rule">
      <Stack.Screen
        name="Define_context_rule"
        component={AddContextRuleScreen}
        options={{ title: 'Define Context Rule' }}
      />

    </Stack.Navigator>
  );
};

export default ContextRuleStack;
