import React, { useState, useEffect, useCallback } from 'react';
import {   Text } from 'react-native';
// Gluestack UI
import { Box } from '@/components/ui/box';
// EMs
import * as Communication from '../em/Fetch';
// DB
import * as Schemas from '../realmSchemas/RealmServices';
// UI
import NavFooter from '../components/NavFooter';
import TabList from '../components/TabList';

const HomeScreen = ({ navigation }) => {
    const [defaults, setDefaults] = useState([]);
    console.log('Home defaults:' + defaults);
    const loadData = useCallback(() => {
      console.log('load data');
      const user = Schemas.retrieveUser();
      console.log('User found ' + user);
      if (user) {
        const userToken = user.token;
        const activities = Schemas.filterActivities(userToken);
        const now = new Date();

        try {
          const filteredActivities = activities.filtered(
            'rating = 0 AND discarded = false AND state = "default" AND (ending >= $0 or ending == nil)',
            now
          );
          console.log('Filtered activities:', filteredActivities.length);
          setDefaults(Array.from(filteredActivities));
        } catch (error) {
          console.error('Error filtering activities:', error);
        }

      }
    }, []);



  useEffect(() => {
    console.log('HOME: componentDidMount');
    Communication.testConnection(); // optional
    loadData();
    console.log('HOME: App started!');
  }, [loadData]);

  return (
    <Box flex={1} bgColor="$white">
      <TabList data={defaults} />
      <NavFooter  tab={'Default'} />
    </Box>
  );
};

export default HomeScreen;
