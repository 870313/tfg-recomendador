//React
import React, {useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
import {checkEMAvailability} from '../em/Fetch'; // named export for the new probe

//Schemas
import * as Schemas from '../realmSchemas/RealmServices';

//Rule engine (Siddhi native OR JS, selected via the RULE_ENGINE Parameter)
import {
  getEngine,
  bootstrapRuleEngine,
  _resetEngineCache,
} from '../background/ruleEngineAdapter';

//Bridge between the rule engine (Sprint 3) and the recommendation engine (Sprint 2)
import {bootstrapRecommendationBridge} from '../ruleEngine';

//Notifications
import * as Notifications from '../events/Notification';

//Settings value
import {getSettingValue} from '../realmSchemas/SettingsServices';

//P2P
import {initializeP2PIfEnabled} from '../p2p/communicationService';

//Zaragoza Open Data (PASEO integration)
import {realm} from '../realmSchemas/RealmInstance';
import {syncPOIs} from '../dataSource/ZaragozaDataSource';

const LoadingScreen = ({navigation}) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Request app permissions FIRST, always. Doing this before the
        //    if (user) / else branch guarantees that iOS shows the three
        //    permission dialogs the first time the app runs on any device,
        //    regardless of whether a Realm-persisted user already exists.
        //    This matches what the user manual (Anexo D) describes.
        await requestAppPermissions();

        const user = Schemas.retrieveUser();
        console.log('User:', user);

        // 2. Initial load of Zaragoza POIs when the local DB is empty.
        //    Kept here (inside Loading.js#initialize) because this screen is
        //    the single entry-point that prepares the app state.
        await ensureZaragozaPOIsLoaded();

        // 3. Ensure a user exists (create a local test user the first time),
        //    then prepare the session and navigate to Home. The two branches
        //    share the same tail (prepareSession + navigate) so that adding
        //    steps in the future doesn't require duplicating them.
        if (!user) {
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

          // Seed example rules/exclusions only on the very first launch.
          Schemas.storeContextRulesFromJson(getContextRulesExamples());
          Schemas.storeExclusionSetsFromJson(getExclusionSetsExamples());
        }

        await prepareSession();
        navigation.replace('Home');
      } catch (error) {
        console.error('Loading error:', error);
        navigation.replace('Home');
      }
    };

    /**
     * Downloads Zaragoza POIs the first time the app runs (empty Realm).
     * Failures are logged but do NOT block the rest of the initialization:
     * the app must remain usable offline / without the open-data endpoint.
     */
    const ensureZaragozaPOIsLoaded = async () => {
      try {
        const count = realm.objects('ZaragozaPOI').length;
        if (count > 0) {
          console.log(
            `[Loading] ZaragozaPOI already populated (${count} rows), skipping initial sync.`,
          );
          return;
        }

        console.log(
          '[Loading] No POIs found in Realm. Starting initial Zaragoza sync...',
        );
        const result = await syncPOIs();
        console.log(
          `[Loading] Initial Zaragoza sync done: ${result.inserted}/${result.total} POIs stored.`,
        );
      } catch (err) {
        console.warn(
          '[Loading] Initial Zaragoza sync failed, continuing without POIs:',
          err,
        );
      }
    };

    const prepareSession = async () => {
      require('../experiments/benchmark').clearSyntheticRules();
      await myPosition.getLocationAsync();
      await myCalendar.getCalendarAsync();

      // Force the JavaScript rule engine on Android as well. The native
      // Siddhi engine (used by default on Android before this line) has a
      // known limitation with the sequential `A -> B` SiddhiQL pattern
      // generated for triggering rules that combine several context rules:
      // when all context rules match in the same tick, Siddhi does not fire
      // consistently, so the user-defined triggering rules would not
      // dispatch a recommendation. The JavaScript engine implements the
      // same semantics as a pure logical AND and fires reliably in that
      // case. Only touched the first time; subsequent boots read the
      // persisted flag from Realm as-is.
      try {
        const currentEngine = getSettingValue('*', 'RULE_ENGINE');
        if (currentEngine !== 'js') {
          Schemas.storeParameter('*', 'SETTINGS', 'RULE_ENGINE', 'js');
          _resetEngineCache();
        }
      } catch (e) {
        console.warn('[Loading] Could not force JS rule engine:', e?.message ?? e);
      }

      getEngine().connect();
      bootstrapRuleEngine();
      // Wire rule-engine triggers to the Sprint-2 recommendation algorithms.
      // Uses the default type→algorithm and type→keywords maps; pass a
      // config object here to override.
      bootstrapRecommendationBridge();

      // Probe the EM backend so AlgorithmRegistry knows whether EM-bound
      // algorithms can be offered. Awaited so any code that runs after this
      // sees the correct flag; the probe itself has a 3s per-EM timeout so it
      // can't stall startup for long.
      await checkEMAvailability();

      const currentToken = Schemas.currentToken();

      // Inicializa P2P automáticamente si está habilitado en settings
      await initializeP2PIfEnabled(currentToken);
    };

    /**
     * Requests the three permissions the app needs (calendar, location,
     * notifications). Wrapped in try/catch so that a single failed dialog
     * does not abort the whole boot sequence. The result is a boolean but
     * it is currently only consumed for logging: the app continues to boot
     * even with partial permissions, degrading gracefully (e.g. closeness
     * recommendations simply return empty when location is denied).
     *
     * @returns {Promise<boolean>} true iff all three permissions were granted.
     */
    const requestAppPermissions = async () => {
      let calendar = 'denied';
      let location = RESULTS.DENIED;
      let notifications = false;
      try {
        calendar = await RNCalendarEvents.requestPermissions();
      } catch (e) {
        console.warn('[Loading] Calendar permission request failed:', e);
      }
      try {
        location =
          Platform.OS === 'ios'
            ? await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
            : await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      } catch (e) {
        console.warn('[Loading] Location permission request failed:', e);
      }
      try {
        notifications = await Notifications.configureNotifications();
        if (notifications) {
          await Notifications.createDefaultChannel();
        }
      } catch (e) {
        console.warn('[Loading] Notifications permission request failed:', e);
      }
      const allGranted =
        calendar === 'authorized' &&
        location === RESULTS.GRANTED &&
        notifications;
      if (!allGranted) {
        console.warn(
          '[Loading] Some permissions were not granted; some features will be degraded ' +
            `(calendar=${calendar}, location=${location}, notifications=${notifications}).`,
        );
      }
      return allGranted;
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
