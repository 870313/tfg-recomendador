import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
import MainStack from './MainStack';
const Drawer = createDrawerNavigator();

function renderCustomDrawer(props) {
  return <CustomDrawer {...props} />;
}

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Main"
      drawerContent={renderCustomDrawer}
    >
      <Drawer.Screen name="Main" component={MainStack} options={{ headerShown: false }} />

    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
