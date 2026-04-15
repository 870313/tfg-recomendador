import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
//Gluestack UI
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
//DB
import * as Schemas from '../../realmSchemas/RealmServices';

export default function WeatherContextRule({ navigation }) {
  const initialWeather = [
    { key: 'Clear', checked: false },
    { key: 'Clouds', checked: false },
    { key: 'Drizzle', checked: false },
    { key: 'Fog', checked: false },
    { key: 'Rain', checked: false },
    { key: 'Snow', checked: false },
    { key: 'Thunderstorm', checked: false },
  ];

  const [name, setName] = useState('');
  const [checkWeather, setCheckWeather] = useState(initialWeather);
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');

  const toggleWeather = (index) => {
    const updated = [...checkWeather];
    updated[index].checked = !updated[index].checked;
    setCheckWeather(updated);
  };

  const onPressSaveButton = () => {
    const trimmedName = name.trim();
    const checked = checkWeather.some((w) => w.checked);

    if (!trimmedName || minTemp === '' || maxTemp === '') {
      Alert.alert('Warning', 'All fields must be completed');
    } else if (trimmedName.includes(' ')) {
      Alert.alert('Warning', "Name field can't contain spaces.");
    } else if (trimmedName.replace(/[^0-9]/g, '').length === trimmedName.length) {
      Alert.alert('Warning', 'Name field must contain at least one letter.');
    } else if (!/[a-zA-Z]/.test(trimmedName[0])) {
      Alert.alert('Warning', 'First character of name must be a letter.');
    } else if (!checked) {
      Alert.alert('Warning', 'You must select at least one weather status.');
    } else if (Number(minTemp) >= Number(maxTemp)) {
      Alert.alert('Warning', 'MinTemp must be smaller than MaxTemp.');
    } else if (Schemas.existsByNameContextRule(trimmedName)) {
      Alert.alert(
        'Warning',
        'There is already a context rule with that name. You must choose another one.'
      );
    } else {
      Schemas.storeWeatherContextRule(
        trimmedName,
        checkWeather,
        Number(minTemp),
        Number(maxTemp)
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
      <Text size="xl" mb="$2" color="$coolGray700">
        Name
      </Text>
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


      <Text size="lg" mb={2}>
      Select the weather cases you want:
      </Text>
      <HStack justifyContent="space-between" mb={4}>
        <VStack space="md" flex={1}>
          {checkWeather.slice(0, 4).map((day, i) => (
            <Checkbox
            key={day.key}
            isChecked={day.checked}
            onChange={() => toggleWeather(i)}
            value={day.key}
            size="md"
            >
              <CheckboxIndicator mr="$2" />
              <CheckboxLabel>{day.key}</CheckboxLabel>
            </Checkbox>
          ))}
        </VStack>
        <VStack space="md" flex={1}>
          {checkWeather.slice(4).map((day, i) => (
            <Checkbox
            key={day.key}
            isChecked={day.checked}
            onChange={() => toggleWeather(i + 4)}
            value={day.key}
            size="md"
            >
              <CheckboxIndicator mr="$2" />
              <CheckboxLabel>{day.key}</CheckboxLabel>
            </Checkbox>
          ))}
        </VStack>
      </HStack>

    <Text size="lg" mb={2}>
      Select temperature range:
    </Text>

    <HStack alignItems="center" style={styles.timeRow}>
      <Text mr="$2" color="$coolGray800" size="md">
        Min temp:
      </Text>
      <Input
      size="md"
      variant="underlined"
      style={styles.timePicker}
      isDisabled={false}
      isInvalid={false}
      isReadOnly={false}
      >
        <InputField
        keyboardType="numeric"
        maxLength={2}
        value={minTemp}
        onChangeText={setMinTemp}
        placeholder="5"
        />
      </Input>
      <Text ml={2}>ºC</Text>

    </HStack>

    <HStack alignItems="center" style={styles.timeRow}>
      <Text mr="$2" color="$coolGray800" size="md">
        Max temp:
      </Text>
      <Input
      size="md"
      variant="underlined"
      style={styles.timePicker}
      isDisabled={false}
      isInvalid={false}
      isReadOnly={false}
      >
        <InputField
        keyboardType="numeric"
        maxLength={2}
        value={maxTemp}
        onChangeText={setMaxTemp}
        placeholder="30"
        />
      </Input>
      <Text ml={2}>ºC</Text>

    </HStack>

    <Button onPress={onPressSaveButton} style={styles.saveButton} size="2xl">
      <Text style={styles.textWhite} bold>
        Save
      </Text>
    </Button>
    </ScrollView>
  );
}

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
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    width: 80,
  },
  timeRow: {
    marginBottom: 20,
  },
});
