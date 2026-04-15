/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { processItem } from './src/events/Notification';

// This block manages notification events when the app is in the foreground
notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('NOTIFICATION (foreground):', detail.notification);
      try {
        processItem(detail.notification.data);
      } catch (e) {
        console.log('Error processing notification in foreground:', e);
      }
    }
  });

// This block manages notification events when the app is in the background or quit
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('NOTIFICATION (background):', detail.notification);
    try {
      await processItem(detail.notification.data);  // Asegúrate de usar async/await si es necesario
    } catch (e) {
      console.log('Error processing notification in background:', e);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);

