import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';

import * as Schemas from '../realmSchemas/ExclusionSetsServices';

const TabListExclusionSets = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [exclusionSets, setExclusionSets] = useState([]);

  const loadData = useCallback(() => {
    const results = Schemas.retrieveExclusionSetsSortByPos();
    if (results) {
      const array = Object.keys(results).map((key) => results[key]);
      setExclusionSets(array);
    }
  }, []);


  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const onPressExclusionSet = (item) => {
    console.log('Item exclusion: ' + item.name);
    navigation.navigate('Exclusion_set_stack', {screen:'Edit_Exclusion_Set', params: { exclusionSet: item } });
  };

  const onDeleteExclusionSet = (item, index) => {
    const copy = [...exclusionSets];
    copy.splice(index, 1);
    setExclusionSets(copy);
    const nameItem = item.name;
    Schemas.deleteExclusionSetById(item.id);
    Alert.alert(nameItem, 'Deleted');
  };

  const onUpExclusionSet = (item) => {
    const i = item.pos;
    const above = Schemas.retrieveExclusionSetByPos(i - 1);
    console.log('Position ' + i);
    console.log('Above one ' + above);
    if (above) {
      Schemas.updateExclusionSetPos(item.id, i - 1);
      Schemas.updateExclusionSetPos(above.id, i);
      loadData();
    }
  };


  const onDownExclusionSet = (item) => {
    const i = item.pos;
    const below = Schemas.retrieveExclusionSetByPos(i + 1);
    if (below) {
      Schemas.updateExclusionSetPos(item.id, i + 1);
      Schemas.updateExclusionSetPos(below.id, i);
      loadData();
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.rowFront}>
      <TouchableOpacity onPress={() => onPressExclusionSet(item)} style={styles.touchableOpacity}>
        <Text style={styles.bold}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onUpExclusionSet(item)}>
          <Icon as={ArrowUpCircle} style={styles.arrowButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDownExclusionSet(item)}>
          <Icon as={ArrowDownCircle} style={styles.arrowButton}/>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHiddenItem = ({ item, index }) => (
    <View style={styles.rowBack}>
      <Button onPress={() => onDeleteExclusionSet(item, index)} action="negative">
        <Icon as={Trash2} size="xl" className="text-white" />
      </Button>
    </View>
  );

  return (
    <SwipeListView
      data={exclusionSets}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={-75}
      style={styles.swipeList}
      contentContainerStyle={styles.swipeContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.txtUp}>
            In case of contradictions between exclusion sets, the exclusion sets are considered in
            the order in which they are listed. You can order exclusion sets using the up and down
            arrow buttons.
          </Text>
        </View>
      }
    />

  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 80,
  },
  arrowButton: {
    height: 35,
    width: 35,
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#eee',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 80,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  swipeContent: {
    flexGrow: 1,
  },
  swipeList: {
    flex: 1,
  },
  touchableOpacity: {
    flex: 1,
  },
  txtUp: {
    color: 'dimgrey',
    fontSize: 16,
  },
});

export default React.memo(TabListExclusionSets);
