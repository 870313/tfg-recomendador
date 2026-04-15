import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//Gluestack UI
import { HStack } from '@/components/ui/hstack';
import {
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
} from '@/components/ui/checkbox';
import { CheckIcon } from '@/components/ui/icon';
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
import { Switch } from '@/components/ui/switch';
import { ChevronDownIcon } from 'lucide-react-native';
import NavFooter from '../components/NavFooter';
import * as Schemas from '../realmSchemas/RealmServices';
import {toggleSettingValue, getMergedShareOptions, getSettingValue } from '../realmSchemas/SettingsServices';
import {initializeP2PIfEnabled, stopP2P,} from '../p2p/communicationService';

const defaultShareOptions = [
    { key: 'Restaurants', value: true },
    { key: 'Shops', value: true },
    { key: 'Museums', value: true },
    { key: 'Places Of Interest', value: true },
    { key: 'Accommodation', value: true },
    { key: 'ShowsHalls', value: true },
    { key: 'EntertainmentEstablishments', value: true },
    { key: 'Leisure', value: true },
    { key: 'ChangeRoom', value: true },
  ];

const SettingsScreen = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [checkbox, setCheckbox] = useState([]);
  const [order, setOrder] = useState('default');
  const [switchState, setSwitchState] = useState(false);

  const loadSettings = useCallback(() => {
    let currentToken = token || Schemas.currentToken();
    setToken(currentToken);

    const cb = getMergedShareOptions(currentToken, defaultShareOptions);

    const currentOrder = Schemas.retrieveOrder(currentToken);
    const p2pEnabled = getSettingValue(currentToken, 'P2P_ENABLED');
    
    setCheckbox(cb);
    setOrder(currentOrder);
    setSwitchState(p2pEnabled);
  }, [token]);

  const handleSwitchChange = async () => {
    try {
      // Toggle en la DB
      const newValue = toggleSettingValue(token, 'P2P_ENABLED', switchState);
      setSwitchState(newValue);
  
      if (newValue) {
        // ENCENDER P2P usando el helper
        await initializeP2PIfEnabled(token);
      } else {
        // APAGAR P2P
        await stopP2P();
      }
    } catch (err) {
      console.warn('Error cambiando estado P2P:', err);
      // revertimos toggle si hay error
      toggleSettingValue(token, 'P2P_ENABLED', !switchState);
      setSwitchState(!switchState);
    }
  };
  

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onPressCb = (item) => {
    const newValue = !item.value;
    toggleSettingValue(token, item.key, item.value);
    const updatedCheckbox = checkbox.map(cb =>
      cb.key === item.key ? { ...cb, value: newValue } : cb
    );
    setCheckbox(updatedCheckbox);
  };


  const onValueChange = (value) => {
    setOrder(value);
    if (token) {
      Schemas.modifyOrder(token, value);
    }
  };

  return (
    <>
        <ScrollView contentContainerStyle={styles.scrollView}>
            <Text style={styles.sectionTitle}>Kind of activities to show</Text>
            {checkbox.map((item, index) => (
            <View key={item.key}>
              <HStack alignItems="center" space="md" px="$4" py="$2">
                <Checkbox
                  size="md"
                  isChecked={item.value}
                  onChange={() => onPressCb(item)}
                  value={item.key}
                  accessibilityLabel={item.key}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                </Checkbox>
                <Text style={styles.label}>{item.key}</Text>
              </HStack>

              {/* Separator*/}
              <View style={styles.lineView} />
            </View>
          ))}
            <Text style={styles.sectionTitle}>Order activities by</Text>
            <Select
              selectedValue={order}
              onValueChange={onValueChange}
              isDisabled={false}
            >
              <SelectTrigger variant="underlined" size="xl" style={styles.select}>
                <SelectInput placeholder="Order by..." />
                <SelectIcon as={ChevronDownIcon} style={styles.safeArea} />
              </SelectTrigger>

              <SelectPortal>
                <SelectBackdrop />
                <SafeAreaView edges={['bottom']}>
                  <SelectContent>
                    <SelectItem label="Arrival time" value="default" key="default" />
                    <SelectItem label="Title" value="title" key="title" />
                    <SelectItem label="Stars" value="stars" key="stars" />
                    <SelectItem label="Ending time" value="time" key="time" />
                    <SelectItem label="Distance" value="distance" key="distance" />
                    <SelectItem label="Type" value="type" key="type" />
                  </SelectContent>
                </SafeAreaView>
              </SelectPortal>
            </Select>

            {/* Separator*/}
            <View style={styles.lineView} />
            <View className="flex-row items-center justify-between px-4 py-2">
            <Text style={styles.label} className="text-base">
              Activar recomendaciones P2P
            </Text>
            <Switch
              size="md"
              value={switchState}
              onToggle={handleSwitchChange}
            />
          </View>

          <Text className="text-sm text-gray-500 px-4">
            Si lo activas, recibirás recomendaciones basadas en valoraciones de otros usuarios cercanos.
          </Text>
        </ScrollView>
        <NavFooter navigation={navigation} tab="Settings" />
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    label: {
        color: '#111827',
        fontSize: 20,
        marginBottom: 6,
    },
    lineView: {
      backgroundColor: '#ccc',
      height: 1,
      marginVertical: 12,
    },
    scrollView: {
        flexGrow: 1,
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: 'black',
        fontSize: 18,
        justifyContent: 'flex-start',
        marginBottom: '3%',
        marginLeft: '6%',
    },
    select: {
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 20,
      paddingHorizontal: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      width: 350,
    },
});
