import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';

//Gluestack ui
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import * as Schemas from '../../realmSchemas/RealmServices';
import * as ExternalServers from '../../services/externalServers/externalServers.json';
import { ChevronDownIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


/**
 * ServerBasedContextRule - Functional component to create a server-based context rule.
 */
export default function ServerBasedContextRule({ navigation }) {
  // Options fixed arrays
  const measurements = [
    { key: 'co2', value: 'CO2 (ppm)' },
    { key: 'humidity', value: 'Humidity (%)' },
    { key: 'temperature', value: 'Temperature (ºC)' },
  ];

  const signs = [
    { key: 'less', value: '>' },
    { key: 'equal', value: '=' },
    { key: 'greater', value: '<' },
  ];

  // State hooks
  const [name, setName] = useState('');
  const [server, setServer] = useState('default1');
  const [measurement, setMeasurement] = useState('default2');
  const [comparator, setComparator] = useState('default3');
  const [value, setValue] = useState('');

  // Validation & Save
  const onPressSaveButton = () => {
    if (
      name === '' ||
      value === '' ||
      comparator === 'default3' ||
      measurement === 'default2' ||
      server === 'default1'
    ) {
      Alert.alert('Warning', 'All fields must be completed');
      return;
    }

    if (name.includes(' ')) {
      Alert.alert('Warning', "Name field can't contain spaces.");
      return;
    }

    if (name.replace(/[^0-9]/g, '').length === name.length) {
      Alert.alert('Warning', 'Name field must contain at least one letter.');
      return;
    }

    if (!/[a-zA-Z]/.test(name[0])) {
      Alert.alert('Warning', 'First character of name field must be a letter.');
      return;
    }

    if (Schemas.existsByNameContextRule(name)) {
      Alert.alert('Warning', 'There is already a context rule with that name.');
      return;
    }

    Schemas.storeServerBasedContextRule(name, server, measurement, comparator, parseFloat(value));

    Alert.alert('Success!', 'Context rule saved', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Context_rules'),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text size="xl" mb="$2" color="$coolGray700">
        Name
      </Text>
      <Input style={styles.input} size="lg" variant="underlined">
        <InputField
          placeholder="Insert name"
          maxLength={30}
          value={name}
          onChangeText={setName}
        />
      </Input>

      <Text size="xl" mb="$2" color="$coolGray700">
        Select the external server you want:
      </Text>
      <Select selectedValue={server} onValueChange={setServer}>
        <SelectTrigger variant="underlined" size="2xl" style={styles.select}>
          <SelectInput placeholder="Pick server" />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <SelectContent>
              <SelectItem label="Pick server" value="default1" />
              {ExternalServers.list.map((srv) => (
                <SelectItem
                  key={srv.name}
                  label={srv.name}
                  value={srv.name.toLowerCase()}
                />
              ))}
            </SelectContent>
          </SafeAreaView>
        </SelectPortal>
      </Select>


      <Text size="xl" mb="$2" color="$coolGray700">
        Select the measurement and sign:
      </Text>
      <View style={styles.view}>
        <Select selectedValue={measurement} onValueChange={setMeasurement}>
          <SelectTrigger variant="underlined" size="2xl" style={styles.select}>
            <SelectInput placeholder="Measurement" />
            <SelectIcon className="mr-3" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
              <SafeAreaView edges={['bottom']} style={styles.safeArea}>
                <SelectContent>
                  <SelectItem label="Measurement" value="default2" />
                  {measurements.map((m) => (
                    <SelectItem key={m.key} label={m.value} value={m.key} />
                  ))}
                </SelectContent>
              </SafeAreaView>
          </SelectPortal>
        </Select>

        <Select selectedValue={comparator} onValueChange={setComparator}>
          <SelectTrigger variant="underlined" size="2xl" style={styles.select}>
            <SelectInput placeholder="Comparator" />
            <SelectIcon className="mr-3" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SafeAreaView edges={['bottom']} style={styles.safeArea}>
              <SelectContent>
                <SelectItem label="Comparator" value="default3" />
                {signs.map((sign) => (
                  <SelectItem key={sign.key} label={sign.value} value={sign.value} />
                ))}
              </SelectContent>
            </SafeAreaView>
          </SelectPortal>
        </Select>
      </View>

      <Text size="xl" mb="$2" color="$coolGray700">
        Introduce value to compare:
      </Text>
      <Input style={styles.input} size="lg" variant="underlined">
        <InputField
          placeholder="Example: 37"
          maxLength={30}
          keyboardType="numeric"
          value={value}
          onChangeText={(text) => {
            // Remove any non-numeric chars except dot if needed
            const sanitized = text.replace(/[^0-9.]/g, '');
            setValue(sanitized);
          }}
        />
      </Input>

      <Button style={styles.saveButton} onPress={onPressSaveButton} size="2xl">
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
  select: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  view:  {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
});
