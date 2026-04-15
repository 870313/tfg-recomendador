import React, { useEffect, useState } from 'react';
// Glue-Stack UI
import { Box } from '@/components/ui/box';
// DB
import * as Schemas from '../realmSchemas/RealmServices';
// UI
import NavFooter from '../components/NavFooter';
import TabList from '../components/TabList';

const HistoricScreen = ({ navigation }) => {
  const [historic, setHistoric] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        console.log('HISTORIC: componentDidMount');
        const user = Schemas.retrieveUser();
        if (user) {
          const token = user.token;
          const actvt = Schemas.filterActivities(token);
          const now = new Date();

          const historicItems = actvt.filtered(
            'state = "default" AND discarded = false AND (ending < $0 OR rating > 0)', now
          );

          setHistoric(historicItems);
        }
      } catch (error) {
        console.error('Error loading historic activities:', error);
      }
    };

    loadData();
  }, []);

  return (
    <Box flex={1} bgColor="$white">
      <TabList data={historic} />
      <NavFooter tab={'Historic'} />
    </Box>
  );
};

export default HistoricScreen;
