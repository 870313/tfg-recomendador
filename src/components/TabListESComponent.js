import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {  View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//GLuestack UI
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
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { ChevronDownIcon, CircleMinus } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import { Button } from '@/components/ui/button';

import * as Schemas from '../realmSchemas/ExclusionSetsServices';
import { useRoute, useNavigation } from '@react-navigation/native';

const RECOMMENDATION_TYPES = [
  'Restaurants', 'Shops', 'Museums', 'Places Of Interest',
  'Accommodation', 'ShowsHalls', 'EntertainmentEstablishments', 'Leisure',
];

const LabeledInputField = ({
  label,
  value,
  placeholder,
  onChangeText,
  readOnly = true,
}) => (
  <>
    <Text style={styles.label} size="2xl">{label}</Text>
    <Input
      style={styles.input}
      size="lg"
      variant="underlined"
      isReadOnly={readOnly}
      isDisabled={readOnly}
    >
      <InputField
        placeholder={placeholder}
        maxLength={30}
        value={value}
        onChangeText={onChangeText}
        editable={!readOnly}
        pointerEvents={readOnly ? 'none' : 'auto'}
      />
    </Input>
  </>
);

const TabListESComponent = ({ createScreen }) => {
  const navigation = useNavigation();
  const { exclusionSet } = useRoute().params || {};

  const [name, setName] = useState('');
  const [recommendationTypesSelected, setRecommendationTypesSelected] = useState([]);
  const [edit, setEdit] = useState(createScreen);

  useEffect(() => {
    if (createScreen) {
      setRecommendationTypesSelected([{ index: 0, selection: 'default' }]);
    }
  }, [createScreen]);

  useEffect(() => {
    if (!createScreen && exclusionSet) {
      setName(exclusionSet.name);
      const rows = exclusionSet.recommendationType.map((type, i) => ({
        index: i,
        selection: type,
      }));
      setRecommendationTypesSelected(rows);
    }
  }, [createScreen, exclusionSet]);

  useLayoutEffect(() => {
    if (name) {
      navigation.setOptions({ title: name });
    }
  }, [name, navigation]);


  const addRecommendationTypeRow = useCallback(() => {
    setRecommendationTypesSelected(prev => [
      ...prev,
      { index: prev.length > 0 ? prev[prev.length - 1].index + 1 : 0, selection: 'default' },
    ]);
  }, []);

  const updateSelection = useCallback((index, selection) => {
    setRecommendationTypesSelected(prev =>
      prev.map(item =>
        item.index === index ? { ...item, selection } : item
      )
    );
  }, []);

  const deleteRow = useCallback((rowIndex) => {
    setRecommendationTypesSelected(prev =>
      prev.filter((_, idx) => idx !== rowIndex)
    );
  }, []);

  const onSave = useCallback(() => {
    const selections = recommendationTypesSelected.map(item => item.selection);
    const hasDefault = selections.includes('default');
    const uniqueSelections = new Set(selections);

    if (!name || recommendationTypesSelected.length === 0 || hasDefault) {
      Alert.alert('Warning', 'All fields must be completed');
    } else if (recommendationTypesSelected.length < 2) {
      Alert.alert('Warning', 'You must select two or more recommendation types.');
    } else if (uniqueSelections.size !== selections.length) {
      Alert.alert('Warning', "Recommendation types selected can't be repeated.");
    } else {
      if (createScreen) {
        Schemas.storeExclusionSet(name, recommendationTypesSelected);
      } else {
        Schemas.updateExclusionSet(
          exclusionSet.id,
          name,
          exclusionSet.pos,
          recommendationTypesSelected
        );
      }

      Alert.alert('Success!', 'Exclusion set saved', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Recommendation_exclusions_and_priorities'),
        },
      ]);
    }
  }, [name, recommendationTypesSelected, createScreen, navigation, exclusionSet]);


  const renderEditOrCreateMode = () => (
    <View style={styles.externalView}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <LabeledInputField
          label="Name:"
          value={name}
          placeholder="Insert name"
          readOnly={false}
          onChangeText={setName}
        />
        <Text style={styles.description}>
          Add items pressing "+" button and select recommendation
          types from highest to lowest priority.
        </Text>

        <View style={styles.internalView}>
          {recommendationTypesSelected.map((item, index) => (
            <HStack key={item.index} space="md" style={styles.hstack}>
              <Select
                selectedValue={item.selection}
                onValueChange={(value) => updateSelection(item.index, value)}
                isDisabled={false}
              >
                <SelectTrigger variant="underlined" size="xl" style={styles.select}>
                  <SelectInput placeholder="Pick one"  />
                  <SelectIcon className="ml-3" as={ChevronDownIcon} style={styles.safeArea} />
                </SelectTrigger>

                <SelectPortal>
                  <SelectBackdrop />
                  <SafeAreaView edges={['bottom']}>
                    <SelectContent>
                      <SelectItem label="Pick one" value="default" key="default" />
                      {RECOMMENDATION_TYPES.map(type => (
                        <SelectItem label={type} value={type} key={type} />
                      ))}
                    </SelectContent>
                  </SafeAreaView>
                </SelectPortal>
              </Select>

              {recommendationTypesSelected.length > 1 && (
                <Pressable onPress={() => deleteRow(index)} hitSlop={10}>
                  <Icon as={CircleMinus} size="3xl" color="black" style={styles.icon} />
                </Pressable>
              )}
            </HStack>
          ))}
        </View>

        {/* Button behin de list */}
        <Button onPress={addRecommendationTypeRow} style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </Button>

        <View style={styles.lineView}>
        <View
          style={styles.lineStyle}
        />
        </View>

        <Button style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveText}>Save</Text>
        </Button>
      </ScrollView>
    </View>
  );

  const renderViewMode = () => (
    <View style={styles.externalView}>
    <ScrollView contentContainerStyle={styles.scrollView}>
      <LabeledInputField
        label="Name:"
        value={name}
        placeholder="Insert name"
        readOnly={true}
        onChangeText={setName}
      />
      <Text style={styles.description}>
      List of recommendation types ordered from highest to lowest priority.
      </Text>

      <View style={styles.internalView}>
        {recommendationTypesSelected.map((item, index) => (
          <HStack key={item.index} space="md" style={styles.hstack}>
            <Select
              selectedValue={item.selection}
              onValueChange={(value) => updateSelection(item.index, value)}
              isDisabled={true}
            >
              <SelectTrigger variant="underlined" size="xl" style={styles.select}>
                <SelectInput placeholder="Pick one"  />
                <SelectIcon className="ml-3" as={ChevronDownIcon} style={styles.safeArea} />
              </SelectTrigger>

              <SelectPortal>
                <SelectBackdrop />
                <SafeAreaView edges={['bottom']}>
                  <SelectContent>
                    <SelectItem label="Pick one" value="default" key="default" />
                    {RECOMMENDATION_TYPES.map(type => (
                      <SelectItem label={type} value={type} key={type} />
                    ))}
                  </SelectContent>
                </SafeAreaView>
              </SelectPortal>
            </Select>
          </HStack>
        ))}
      </View>

      <View style={styles.lineView}>
      <View
        style={styles.lineStyle}
      />
      </View>

      <Button style={styles.saveButton} onPress={() => setEdit(true)}>
        <Text style={styles.saveText}>Edit</Text>
      </Button>
    </ScrollView>
  </View>
  );
    return (
      <>
        {edit ? renderEditOrCreateMode() : renderViewMode()}
      </>
    );

};


export default React.memo(TabListESComponent);

  const styles = StyleSheet.create({
    addButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#03A9F4',
    borderRadius: 30,
    elevation: 4,
    height: 60,
    marginRight:20,
    marginTop: 32,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: 60,
  },
    addText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
    description: {
      fontSize: 16,
      marginBottom: '7%',
      marginLeft: 20,
      marginRight: 20,
  },
    externalView: {
      flex: 1,
    },
    hstack: {
      alignItems: 'center',
    },
    icon: {
    marginBottom:20,
  },
    input: {
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 1,
      fontSize: 16,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      paddingHorizontal: 12,
      paddingVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    internalView: {
      gap: 16,
    },
    label: {
      color: '#111827',
      fontSize: 20,
      marginBottom: 6,
      marginLeft: 20,
    },
  lineStyle: {
        backgroundColor: '#e0e0e0',
        height: 1,
        width: '100%',
    },
  lineView: {
      alignSelf: 'stretch',
      marginVertical: 24,
    },

  saveButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    borderRadius: 20,
    elevation: 4,
    marginRight:20,
    marginTop: 32,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 20,

  },
  scrollView: {
      paddingBottom: 100,
      paddingHorizontal: 20,
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
    minWidth: 300,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  });

