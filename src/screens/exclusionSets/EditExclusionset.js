import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// UI
import TabListESComponent from '../../components/TabListESComponent';

/**
 * AddExclusionSetScreen: adds a new exclusion set.
 * Sends createScreen=true to the TabListESComponent to let it know that a new exclusion
 * set is to be created.
 */
const AddExclusionSetScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TabListESComponent navigation={navigation} createScreen={false} />
    </View>
  );
};

export default AddExclusionSetScreen;

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
    },
  });
