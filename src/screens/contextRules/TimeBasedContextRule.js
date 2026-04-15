import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
//GLuestack ui
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
// DB
import * as Schemas from '../../realmSchemas/RealmServices';

const TimeBasedContextRule = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('__:__');
  const [selectedEndTime, setSelectedEndTime] = useState('__:__');
  const [formatStartTime, setFormatStartTime] = useState(null);
  const [formatEndTime, setFormatEndTime] = useState(null);
  const [visiblePickerStart, setVisiblePickerStart] = useState(false);
  const [visiblePickerEnd, setVisiblePickerEnd] = useState(false);

  const handlePickerStart = (time) => {
    console.log('Start time picked:', time);
    setVisiblePickerStart(false);
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (hours <= 9) {hours = '0' + hours;}
    if (minutes <= 9) {minutes = '0' + minutes;}
    setFormatStartTime(time);
    setSelectedStartTime(`${hours}:${minutes}`);
  };

  const handlePickerEnd = (time) => {
    setVisiblePickerEnd(false);
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (hours <= 9) {hours = '0' + hours;}
    if (minutes <= 9) {minutes = '0' + minutes;}
    setFormatEndTime(time);
    setSelectedEndTime(`${hours}:${minutes}`);
  };

  const onPressSaveButton = () => {
    const n = name.trim();
    const startTime = selectedStartTime;
    const endTime = selectedEndTime;


    if (!n || startTime === '__:__' || endTime === '__:__') {
      Alert.alert('Warning', 'All fields must be completed');
    } else if (n.includes(' ')) {
      Alert.alert('Warning', "Name field can't contain spaces.");
    } else if (n.replace(/[^0-9]/g, '').length === n.length) {
      Alert.alert('Warning', 'Name field must contain at least one letter.');
    } else if (!/[a-zA-Z]/.test(n[0])) {
      Alert.alert('Warning', 'First character of name field must be a letter.');
    } else if (formatStartTime >= formatEndTime) {
      Alert.alert('Warning', 'End Time must be greater than Start Time');
    } else if (Schemas.existsByNameContextRule(n)) {
      Alert.alert('Warning', 'There is already a context rule with that name.');
    } else {
      Schemas.storeTimeBasedContextRule(n, startTime, endTime);
      Alert.alert('Success!', 'Context rule saved', [
        { text: 'OK', onPress: () => navigation.navigate('Context_rules') },
      ]);
    }
  };

  return (
    <View style={styles.container}>

      <Text size="xl" mb="$2" color="$coolGray700">Name</Text>
      <Input
      style={styles.input}
      size="lg"
      variant="underlined"
      isDisabled={false}
      isInvalid={false}
      isReadOnly={false}
      >
        <InputField
        placeholder="Insert name"
        maxLength={30}
        value={name}
        onChangeText={setName}
        />
      </Input>

      <View style={styles.timeRow}>
        <Text size="md" mb="$2" color="$coolGray700">Start Time</Text>
        <TouchableOpacity style={styles.timePicker} onPress={() => setVisiblePickerStart(true)}>
          <Text size="md" color="$coolGray800">{selectedStartTime}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeRow}>
        <Text size="md" mb="$2" color="$coolGray700">End Time</Text>
        <TouchableOpacity style={styles.timePicker} onPress={() => setVisiblePickerEnd(true)}>
          <Text size="md" color="$coolGray800">{selectedEndTime}</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
      isVisible={visiblePickerStart}
      mode="time"
      onConfirm={handlePickerStart}
      onCancel={() => setVisiblePickerStart(false)}
      />

      <DateTimePickerModal
      isVisible={visiblePickerEnd}
      mode="time"
      onConfirm={handlePickerEnd}
      onCancel={() => setVisiblePickerEnd(false)}
      />


      <TouchableOpacity onPress={onPressSaveButton} style={styles.saveButton}>
        <Text size="md" style={styles.textWhite}>Save</Text>
      </TouchableOpacity>
    </View>
  );

};

export default TimeBasedContextRule;

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#F9FAFB',
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 1,
      marginBottom: 20,
      paddingHorizontal: 10,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    saveButton: {
      alignSelf: 'flex-end',
      backgroundColor: '#2563EB',
      borderRadius: 20,
      elevation: 4,
      marginTop: 32,
      paddingHorizontal: 28,
      paddingVertical: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    textWhite: {
      color: '#FFFFFF',
    },
    timePicker: {
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      borderWidth: 1,
      elevation: 1,
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    timeRow: {
      marginBottom: 20,
    },
  });

