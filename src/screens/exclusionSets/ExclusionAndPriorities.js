import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Box } from '@/components/ui/box';

import TabListExclusionSets from '../../components/TabListExclusionSets';
import NavFooter from '../../components/NavFooter';

/**
 * ExclusionsAndPrioritiesScreen
 * Displays the list of exclusion-sets created by the user.
 * Allows adding, editing and deleting exclusion sets.
 */
const ExclusionsAndPrioritiesScreen = ({navigation}) => {

  const handleAddExclusionSet = () => {
    navigation.navigate('Exclusion_set_stack', {screen:'Define_Exclusion_Set'});
  };

  return (
    <Box style={styles.container}>
      <TabListExclusionSets navigation={navigation} />

      <TouchableOpacity onPress={handleAddExclusionSet} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <NavFooter navigation={navigation} tab="ExclusionSets" />
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
