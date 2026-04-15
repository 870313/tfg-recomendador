import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// UI
import TabListCRforTR from '../../components/TabListCRforTR';

/**
 * EditTriggeringRuleScreen: shows or edits an existing triggering-rule.
 * Sends createScreen=false to the TabListCRforTR to let it know that it has to work
 * with an existing triggering-rule.
 */
const EditTriggeringRule = () => {
  console.log('Rendering EditTriggeringRule');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TabListCRforTR navigation={navigation} createScreen={false} />
    </View>
  );
};

export default EditTriggeringRule;

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
    },
  });
