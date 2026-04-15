import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// UI
import TabListCRforTR from '../../components/TabListCRforTR';

/**
 * AddTriggeringRuleScreen: adds a new triggering rule.
 * Sends createScreen=true to the TabListCRforTR to let it know that a new triggering rule
 * is to be created.
 */
const AddTriggeringRule = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TabListCRforTR navigation={navigation} createScreen={true} />
    </View>
  );
};

export default AddTriggeringRule;

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
    },
  });
