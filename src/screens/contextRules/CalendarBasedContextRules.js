import React, { useState } from 'react';
import { Alert, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Gluestack UI
import {Button} from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { X } from 'lucide-react-native';
// DB
import * as Schemas from '../../realmSchemas/RealmServices';

import { StyleSheet } from 'react-native';

const CalendarBasedContextRule = ({ navigation }) => {
  const initialDays = [
    { key: 'Monday', checked: false },
    { key: 'Tuesday', checked: false },
    { key: 'Wednesday', checked: false },
    { key: 'Thursday', checked: false },
    { key: 'Friday', checked: false },
    { key: 'Saturday', checked: false },
    { key: 'Sunday', checked: false },
  ];

  const [name, setName] = useState('');
  const [checkDays, setCheckDays] = useState(initialDays);
  const [selectedStartDate, setSelectedStartDate] = useState('__/__/__');
  const [selectedEndDate, setSelectedEndDate] = useState('__/__/__');
  const [formatStartDate, setFormatStartDate] = useState('');
  const [formatEndDate, setFormatEndDate] = useState('');
  const [visiblePickerStart, setVisiblePickerStart] = useState(false);
  const [visiblePickerEnd, setVisiblePickerEnd] = useState(false);

  const toggleDay = (index) => {
    const updated = [...checkDays];
    updated[index].checked = !updated[index].checked;
    setCheckDays(updated);
  };

  const formatDate = (date) => {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePickerStart = (date) => {
    setVisiblePickerStart(false);
    setFormatStartDate(date);
    setSelectedStartDate(formatDate(date));
  };

  const handlePickerEnd = (date) => {
    setVisiblePickerEnd(false);
    setFormatEndDate(date);
    setSelectedEndDate(formatDate(date));
  };

  const deleteDate = (type) => {
    if (type === 'start') {
      setFormatStartDate('');
      setSelectedStartDate('__/__/__');
    } else {
      setFormatEndDate('');
      setSelectedEndDate('__/__/__');
    }
  };

  const onSave = () => {
    const hasCheckedDay = checkDays.some((d) => d.checked);

    if (name === '') {
      Alert.alert('Warning', "Name can't be empty");
    } else if (name.includes(' ')) {
      Alert.alert('Warning', "Name field can't contain spaces.");
    } else if (name.replace(/[^0-9]/g, '').length === name.length) {
      Alert.alert('Warning', 'Name field must contain at least one letter.');
    } else if (!/[a-zA-Z]/.test(name[0])) {
      Alert.alert('Warning', 'First character must be a letter.');
    } else if (!hasCheckedDay) {
      Alert.alert('Warning', 'You must select at least one day of the week.');
    } else if (
      (selectedStartDate === '__/__/__' && selectedEndDate !== '__/__/__') ||
      (selectedEndDate === '__/__/__' && selectedStartDate !== '__/__/__')
    ) {
      Alert.alert('Warning', 'You must select both start and end dates.');
    } else if (
      selectedStartDate !== '__/__/__' &&
      formatStartDate >= formatEndDate
    ) {
      Alert.alert('Warning', 'End date must be after start date.');
    } else if (Schemas.existsByNameContextRule(name)) {
      Alert.alert(
        'Warning',
        'There is already a context rule with that name.'
      );
    } else {
      Schemas.storeCalendarBasedContextRule(
        name,
        checkDays,
        selectedStartDate,
        selectedEndDate
      );
      Alert.alert('Success!', 'Context rule saved', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Context_rules'),
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
        <Text size="lg" mb="$2" color="$coolGray700">Name:</Text>
        <Input
        size="lg"
        variant="underlined"
        style={styles.input}
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        >
        <InputField
            placeholder="Insert name"
            value={name}
            maxLength={30}
            onChangeText={setName}
        />
        </Input>

        <Text size="lg" my="$3" color="$coolGray700">
        Select the days of the week you want:
        </Text>
        <HStack justifyContent="space-between">
            <VStack space="md">
                {checkDays.slice(0, 4).map((day, i) => (
                <Checkbox
                    key={day.key}
                    isChecked={day.checked}
                    onChange={() => toggleDay(i)}
                    size="md"
                    value={day.key}
                >
                    <CheckboxIndicator mr="$2" />
                    <CheckboxLabel>{day.key}</CheckboxLabel>
                </Checkbox>
                ))}
            </VStack>
            <VStack space="md">
                {checkDays.slice(4).map((day, i) => (
                <Checkbox
                    key={day.key}
                    isChecked={day.checked}
                    onChange={() => toggleDay(i + 4)}
                    size="md"
                    value={day.key}
                >
                    <CheckboxIndicator mr="$2" />
                    <CheckboxLabel>{day.key}</CheckboxLabel>
                </Checkbox>
                ))}
            </VStack>
        </HStack>

        <Text mt="$4" mb="$2" color="$coolGray700">
        You can select a date range if you want (optional). Press "x" to delete your selection.
        </Text>

        <HStack style={styles.timeRow} alignItems="center">
            <Text flex={0.4} color="$coolGray700">Start date:</Text>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => setVisiblePickerStart(true)}>
            <Box style={styles.timePicker}>
                <Text>{selectedStartDate}</Text>
            </Box>
            </TouchableOpacity>
            <Pressable onPress={() => deleteDate('start')}>
                <Icon as={X} size="md" />
            </Pressable>
        </HStack>

        <HStack style={styles.timeRow} alignItems="center" mt="$2">
            <Text flex={0.4} color="$coolGray700">End date:</Text>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => setVisiblePickerEnd(true)}>
                <Box style={styles.timePicker}>
                <Text>{selectedEndDate}</Text>
                </Box>
            </TouchableOpacity>
            <Pressable onPress={() => deleteDate('end')}>
                <Icon as={X} size="md" />
            </Pressable>
        </HStack>

        <DateTimePickerModal
        isVisible={visiblePickerStart}
        mode="date"
        onConfirm={handlePickerStart}
        onCancel={() => setVisiblePickerStart(false)}
        />

        <DateTimePickerModal
        isVisible={visiblePickerEnd}
        mode="date"
        onConfirm={handlePickerEnd}
        onCancel={() => setVisiblePickerEnd(false)}
        />


        <Button style={styles.saveButton} onPress={onSave} size="2xl">
                  <Text style={styles.textWhite} bold>
                    Save
                  </Text>
        </Button>
    </ScrollView>

  );
};

export default CalendarBasedContextRule;

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
  touchableOpacity: {
    flex: 0.6,
  },
});
