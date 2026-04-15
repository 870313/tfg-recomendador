import React, { useEffect, useState } from 'react';
//Glue-Stack UI
import { Box } from '@/components/ui/box';
//DB
import * as Schemas from '../realmSchemas/RealmServices';
//UI
import NavFooter from '../components/NavFooter';
import TabList from '../components/TabList';

const SavedScreen = ({ navigation }) => {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        console.log('SAVED: componentDidMount');
        const user = Schemas.retrieveUser();
        if (user) {
          const token = user.token;
          const actvt = Schemas.filterActivities(token);
          const savedItems = actvt.filtered('state = "saved" AND discarded = false');
          setSaved(savedItems);
        }
      } catch (error) {
        console.error('Error loading saved activities:', error);
      }
    };

    loadData();
  }, []);


  return (
    <Box flex={1} bgColor="$white">
      <TabList  data={saved} />
      <NavFooter tab={'Saved'} />
    </Box>
  );
};


export default SavedScreen;
