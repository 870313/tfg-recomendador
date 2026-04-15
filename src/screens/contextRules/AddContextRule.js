import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Gluestack UI
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
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
import { ChevronDownIcon } from 'lucide-react-native';

// Each type of rule screen
import LocationContextRule from './LocationBasedContextRule';
import TimeBasedContextRule from './TimeBasedContextRule';
import CalendarBasedContextRule from './CalendarBasedContextRules';
import WeatherContextRule from './WeatherBasedContextRules';
import ServerBasedContextRule from './ServerBasedContextRule';

// UI
import NavFooter from '../../components/NavFooter';

const AddContextRuleScreen = () => {
  const navigation = useNavigation();
  const [type, setType] = useState('Default');

  const renderRuleComponent = () => {
    switch (type) {
      case 'location':
       return <LocationContextRule navigation={navigation} />;
      case 'time-based':
        return <TimeBasedContextRule navigation={navigation} />;
      case 'calendar-based':
        return <CalendarBasedContextRule navigation={navigation} />;
      case 'weather':
        return <WeatherContextRule navigation={navigation} />;
      case 'server-based':
        return <ServerBasedContextRule navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <Box style={styles.container}>
        <ScrollView>
            <Text style={styles.label} size="3xl">Type:</Text>
            <Select selectedValue={type} onValueChange={(value) => setType(value)}>
                <SelectTrigger variant="underlined" size="xl" style={styles.select}>
                    <SelectInput  placeholder="Pick one" style={styles.selectInput} />
                    <SelectIcon className="ml-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
                    <SelectContent>
                    <SelectItem label="Pick one" value="default" />
                    <SelectItem label="Calendar-Based Trigger" value="calendar-based" />
                    <SelectItem label="Location-Based Trigger" value="location" />
                    <SelectItem label="Time-Based Trigger" value="time-based" />
                    <SelectItem label="Server-Based Trigger" value="server-based" />
                    <SelectItem label="Weather-Based Trigger" value="weather" />
                    </SelectContent>
                    </SafeAreaView>
                </SelectPortal>
            </Select>
            {renderRuleComponent()}
        </ScrollView>
        <NavFooter navigation={navigation} tab="AddContextRule" />
    </Box>

  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    color: 'black',
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 20,
  },
  select: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 24,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectInput: {
    flex: 1,
  },

});

export default AddContextRuleScreen;
