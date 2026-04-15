import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Context rule screen
import AddExclusionSet from '../screens/exclusionSets/AddExclusionSet';
import EditExclusionSet from '../screens/exclusionSets/EditExclusionset';
const Stack = createStackNavigator();
//This is a navigation stack just for the context rules screen
const ExlusionSetStack = () => {
  return (
    <Stack.Navigator initialRouteName="Define_Exclusion_Set">
      <Stack.Screen
        name="Define_Exclusion_Set"
        component={AddExclusionSet}
        options={{ title: 'Define Exclusion Set' }}
      />

      <Stack.Screen
        name="Edit_Exclusion_Set"
        component={EditExclusionSet}
      />
    </Stack.Navigator>
  );
};

export default ExlusionSetStack;
