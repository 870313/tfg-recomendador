import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Trash2, Star, Trash } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import * as Communication from '../em/Fetch';
import * as Schemas from '../realmSchemas/RealmServices';

const TabList = ({ data }) => {
  const navigation = useNavigation();
  const onPressActivity = useCallback((item) => {
    Schemas.markActivityAs(item, 'CLICKED', true);
    Communication.fetchFeedback(item);
    navigation.navigate('Activity', { activity: item });
  }, [navigation]);

  const onDeleteActivity = useCallback((item) => {
    Alert.alert(item.title, 'Is going to be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'For now', onPress: () => Schemas.deleteActivityById(item.id) },
      {
        text: 'Forever',
        onPress: () => {
          Schemas.markActivityAs(item, 'DISCARDED', true);
          Communication.fetchFeedback(item);
        },
      },
    ], { cancelable: true });
  }, []);

  const onSaveActivity = useCallback((item) => {
    Schemas.markActivityAs(item, 'SAVED', true);
    Communication.fetchFeedback(item);
    Alert.alert(item.title, 'Saved');
  }, []);

  const onRemoveActivity = useCallback((item) => {
    Schemas.markActivityAs(item, 'SAVED', false);
    Communication.fetchFeedback(item);
    Alert.alert(item.title, 'Removed from saved');
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.rowFront}>
      <Text onPress={() => onPressActivity(item)}>
        <Text style={styles.bold}>{item.title}</Text>
        <Text> #{item.type}</Text>
      </Text>
    </View>
  );

  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <View style={styles.leftAction}>
        {item.state !== 'saved' ? (
          <Button onPress={() => onSaveActivity(item)}>
            <Icon as={Star}   size="xl"   className="text-typography-white" />
          </Button>
        ) : (
          <Button onPress={() => onRemoveActivity(item)} action="negative">
            <Icon as={Trash} size="xl" className="text-typografhy-white" />
          </Button>
        )}
      </View>
      <View style={styles.rightAction}>
        <Button onPress={() => onDeleteActivity(item)} action="negative">
          <Icon as={Trash2} size="xl" className="text-typografhy-white" />
        </Button>
      </View>
    </View>
  );

  return (
    <SwipeListView
      data={data}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      leftOpenValue={75}
      rightOpenValue={-75}
      style={styles.swipeList}
      contentContainerStyle={styles.swipeContent}
    />
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  leftAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#eee',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
  },
  rowFront: {
    backgroundColor: '#fff',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  swipeContent: {
    flexGrow: 1,
  },
  swipeList: {
    flex: 1,
  },
});

export default React.memo(TabList);
