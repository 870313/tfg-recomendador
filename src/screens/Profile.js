import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
//Gluestack UI
import { HStack } from '@/components/ui/hstack';
import {
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
} from '@/components/ui/checkbox';
import { CheckIcon, AlertCircleIcon } from '@/components/ui/icon';
import {
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlErrorIcon,
    FormControlLabel,
    FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import NavFooter from '../components/NavFooter';
import {
    getCurrentToken,
    loadProfileSettings,
    toggleSetting,
    updateRate,
    updateDistance,
} from '../realmSchemas/ProfileSettingsServices';
const defaultShare = [
    { key: 'User profile', value: true },
    { key: 'Location', value: true },
    { key: 'Accurate Location', value: true },
    { key: 'Weather', value: true },
    { key: 'Calendar events', value: true },
  ];

const ProfileScreen = ({ navigation}) => {
  const [token, setToken] = useState(null);
  const [checkbox, setCheckbox] = useState(defaultShare);
  const [refresh, setRefresh] = useState('3');
  const [refreshError, setRefreshError] = useState(false);
  const [distance, setDistance] = useState('3');
  const [distanceError, setDistanceError] = useState(false);
  const [location, setLocation] = useState(true);

useEffect(() => {
    const currentToken = getCurrentToken();
    setToken(currentToken);

    const { checkbox, location, refresh, distance } = loadProfileSettings(currentToken, defaultShare);
    setCheckbox(checkbox);
    setLocation(location);
    setRefresh(refresh);
    setDistance(distance);
}, []);

const onPressCb = (item) => {
    const updatedValue = toggleSetting(token, item);
    const updatedCheckbox = checkbox.map((element) =>
    element.key === item.key ? { ...element, value: updatedValue } : element
    );

    setCheckbox(updatedCheckbox);
    if (item.key === 'Location') {
    setLocation(updatedValue);
    }
};

const onChangeRefresh = (value) => {
    const result = updateRate(token, value);
    setRefresh(value);
    setRefreshError(!result.success);
};

const onChangeDistance = (value) => {
    const result = updateDistance(token, value);
    setDistance(value);
    setDistanceError(!result.success);
};

return (
    <>
    <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.sectionTitle}>Share with EMs</Text>
        {checkbox.map((item) => {
        // Don't show "Accurate Location" if location is disabled
        if (item.key === 'Accurate Location' && !location) {return null;}

        return (
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

            {/* Separator */}
            <View style={styles.lineView} />
        </View>
        );
        })}
        <View style={styles.view}>

            <FormControl isInvalid={refreshError} mb="$4" style={styles.form}>
                <FormControlLabel mb="$1">
                    <FormControlLabelText style={styles.label}>
                        Communication rate with EMs
                    </FormControlLabelText>
                </FormControlLabel>

                <Input variant="underlined" size="md" borderColor={refreshError ? '$error500' : '$border300'}>
                    <InputField
                    placeholder={refresh}
                    keyboardType="numeric"
                    onChangeText={onChangeRefresh}
                    fontSize="$md"
                    color="$textLight900"
                    />
                    <InputSlot pr="$3">
                    <Text color="$textLight500" fontSize="$sm">Minutes</Text>
                    </InputSlot>
                </Input>

                {refreshError && (
                    <FormControlError mt="$1">
                    <HStack alignItems="center" space="sm">
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText fontSize="$sm">Invalid number</FormControlErrorText>
                    </HStack>
                    </FormControlError>
                )}
            </FormControl>
        </View>

        <View style={styles.view}>
            <FormControl isInvalid={distanceError} mb="$4" style={styles.form}>
                <FormControlLabel mb="$1">

                    <FormControlLabelText style={styles.label}>
                    <Text>Discover EMs nearer than</Text>
                    </FormControlLabelText>
                </FormControlLabel>

                <Input variant="underlined" size="md" borderColor={distanceError ? '$error500' : '$border300'}>
                    <InputField
                    placeholder={distance}
                    keyboardType="numeric"
                    onChangeText={onChangeDistance}
                    fontSize="$md"
                    color="$textLight900"
                    />
                    <InputSlot pr="$3">
                    <Text color="$textLight500" fontSize="$sm">Km</Text>
                    </InputSlot>
                </Input>

                {distanceError && (
                    <FormControlError mt="$1">
                    <HStack alignItems="center" space="sm">
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText fontSize="$sm">Invalid number</FormControlErrorText>
                    </HStack>
                    </FormControlError>
                )}
            </FormControl>
        </View>


    </ScrollView>
    <NavFooter navigation={navigation} tab="Settings" />
    </>
);
};

export default ProfileScreen;

const styles = StyleSheet.create({
    form: {
        justifyContent: 'flex-start',
        marginBottom: '3%',
        marginLeft: '6%',
    },
    label: {
        color: 'black',
        fontSize: 16,
        marginBottom: 6,
    },
    lineView: {
      backgroundColor: '#ccc',
      height: 1,
      marginVertical: 12,
    },
    scrollView: {
        flex: 1,
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
    view: {
        marginTop: '5%',
    },
});
