import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// DB
import * as Schemas from '../../realmSchemas/RealmServices';
import * as myPosition from '../../events/Position';

const LocationContextRule = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('Latitude');
  const [longitude, setLongitude] = useState('Longitude');
  const [locationError, setLocationError] = useState('');

  const getLocation = async () => {
    try {
      const coordinates = await myPosition.getLocationAsyncForRules();
      const [lng, lat] = coordinates.split(',');
      setLongitude(lng);
      setLatitude(lat);
    } catch (err) {
      console.error('Failed to get location', err);
    }
  };

  const handleSave = () => {
    if (!name || !latitude || !longitude || !locationError) {
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
    if (!(/[a-zA-Z]/).test(name[0])) {
      Alert.alert('Warning', 'First character of name field must be a letter.');
      return;
    }

    if (Schemas.existsByNameContextRule(name)) {
      Alert.alert('Warning', 'There is already a context rule with that name. You must choose another one.');
      return;
    }

    Schemas.storeLocationContextRule(name, Number(latitude), Number(longitude), Number(locationError));
    Alert.alert('Success!', 'Context rule saved', [
      { text: 'OK', onPress: () => navigation.navigate('Context_rules') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Insert name"
        maxLength={30}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>GPS latitude:</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.gpsInput}
          placeholder="Latitude"
          maxLength={17}
          keyboardType="numeric"
          value={latitude}
          onChangeText={setLatitude}
        />
      </View>

      <Text style={styles.label}>GPS longitude:</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.gpsInput}
          placeholder="Longitude"
          maxLength={17}
          keyboardType="numeric"
          value={longitude}
          onChangeText={setLongitude}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={getLocation}>
        <Text style={styles.buttonText}>Get current GPS location</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Allow location error (meters):</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.gpsInput}
          placeholder="Distance"
          maxLength={6}
          keyboardType="numeric"
          value={locationError}
          onChangeText={setLocationError}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );


};

export default LocationContextRule;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#6B7280',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  gpsInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    flex: 0.6,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  label: {
    color: '#111827',
    fontSize: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});


