import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Gluestack UI
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
//UI
import TabListCRules from '../../components/TabListCRules';
import NavFooter from '../../components/NavFooter';

/**
 * ContextRulesScreen: displays the list of context-rules created by the user.
 * You can add new context-rules by clicking on the "+" button, edit an existing
 * context-rule by clicking on it and delete a context-rule by swiping to the left.
 */
const ContextRulesScreen = () => {
  const navigation = useNavigation();

  const handleAddRule = () => {
    navigation.navigate('Context_rule_stack', { screen: 'Define_context_rule'});
  };

  return (
        <Box style={styles.container}>
        <TabListCRules navigation={navigation} />
        <TouchableOpacity onPress={handleAddRule} style={styles.fab}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
        <NavFooter navigation={navigation} tab="ContextRules" />
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


export default ContextRulesScreen;
