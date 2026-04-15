//React
import React, {useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  NativeModules,
  Platform,
} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
//App icon
import icon from '../images/icon.png';

//Data for testing
import {
  getContextRulesExamples,
  getExclusionSetsExamples,
} from '../testData/LoadTestData';

//Events
import * as myCalendar from '../events/Calendar';
import * as myPosition from '../events/Position';
//import * as Notifications from '../events/Notification';

//EM
import * as Communication from '../em/Fetch';

//Schemas
import * as Schemas from '../realmSchemas/RealmServices';

//Siddhi
const {SiddhiClientModule} = NativeModules;
import * as CreateSiddhiApp from '../siddhi/index';

//Notifications
import * as Notifications from '../events/Notification';

//Settings value
import {getSettingValue} from '../realmSchemas/SettingsServices';

//P2P
import {initializeP2PIfEnabled} from '../p2p/communicationService';

const LoadingScreen = ({navigation}) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        //Notifications.configureNotifications();

        const user = Schemas.retrieveUser();
        console.log('User:', user);

        if (user) {
          await prepareSession();
          navigation.replace('Home');
        } else {
          // Fake user - no EM needed
          const newUser = {
            email: 'test@test.com',
            token: '999',
            authToken: 'fake-token',
            password: 'fake',
            provider: 'local',
            genre: 'other',
            birth: '2000-01-01',
          };

          Schemas.replaceUser(newUser);

          Alert.alert('INFO', `You are logged in as ${newUser.email} (test)`);

          // Load rules and exclusions
          const rules = getContextRulesExamples();
          const exclusions = getExclusionSetsExamples();

          Schemas.storeContextRulesFromJson(rules);
          Schemas.storeExclusionSetsFromJson(exclusions);

          await fakePermissionLogin();

          navigation.replace('Home');
        }
      } catch (error) {
        console.error('Loading error:', error);
        navigation.replace('Home');
      }
    };

    const prepareSession = async () => {
      await myPosition.getLocationAsync();
      await myCalendar.getCalendarAsync();

      SiddhiClientModule.connect();
      CreateSiddhiApp.createSiddhiApp();

      const currentToken = Schemas.currentToken();

      // Inicializa P2P automáticamente si está habilitado en settings
      await initializeP2PIfEnabled(currentToken);
    };

    const fakePermissionLogin = async () => {
      //Calendar permissions
      const calendar = await RNCalendarEvents.requestPermissions();

      //Location permissions
      const location =
        Platform.OS === 'ios'
          ? await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
          : await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      //Notifications permissions
      const notificationPermission =
        await Notifications.configureNotifications();
      if (
        calendar === 'authorized' &&
        location === RESULTS.GRANTED &&
        notificationPermission
      ) {
        //Create default channel for notifications
        await Notifications.createDefaultChannel();
        await prepareSession();
      } else {
        Alert.alert('Permisos', 'No se otorgaron los permisos necesarios');
      }
    };

    initialize();
  }, [navigation]);

  return (
    <View style={styles.view}>
      <Image style={styles.icon} source={icon} />
      <ActivityIndicator size="large" color="#000" style={styles.loading} />
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  icon: {
    height: 120,
    resizeMode: 'contain',
    width: 120,
  },
  loading: {
    marginTop: 20,
  },
  view: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
  },
});
