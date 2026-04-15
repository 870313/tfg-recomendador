import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Box } from '@/components/ui/box';

import TabListTrules from '../../components/TabListTRules';
import NavFooter from '../../components/NavFooter';

/**
 * TriggeringRulesScreen: displays the list of triggering-rules created by the user.
 * You can add new triggering-rules by clicking on the "+" button, edit an existing
 * triggering-rule by clicking on it and delete a triggering-rule by swiping to the left.
 */
const ExclusionsAndPrioritiesScreen = ({navigation}) => {

  const handleAddTriggeringRule = () => {
    navigation.navigate('Triggering_rule_stack', {
      screen: 'Define_Triggering_rule',
      params: { createScreen: true },
    });
  };

  return (
    <Box style={styles.container}>
      <TabListTrules navigation={navigation} />

      <TouchableOpacity onPress={handleAddTriggeringRule} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <NavFooter navigation={navigation} tab="TriggeringRules" />
    </Box>
  );
};

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
    },
    fab: {
      alignItems: 'center',
      backgroundColor: '#03A9F4',
      borderRadius: 30,
      bottom: 140,
      elevation: 8,
      height: 70,
      justifyContent: 'center',
      position: 'absolute',
      right: 20,
      width: 70,
    },
    fabIcon: {
      color: 'white',
      fontSize: 40,
    },
});

export default ExclusionsAndPrioritiesScreen;
