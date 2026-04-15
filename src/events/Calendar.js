import RNCalendarEvents from 'react-native-calendar-events';

import * as Schemas from '../realmSchemas/RealmServices';

/**
 * Retrieves calendar events for the current week.
 * Authorizes access to the calendar, fetches available calendars,
 * and then fetches events for the next 7 days from those calendars.
 */
export const getCalendarAsync = async () => {
    try {
      console.log('getCalendarAsync(): start');

      // Request calendar permission
      const permission = await RNCalendarEvents.requestPermissions();
      console.log('getCalendarAsync(): permission = ' + permission);

      if (permission === 'authorized') {
        console.log('getCalendarAsync(): authorized');

        // Get available calendars
        const calendars = await RNCalendarEvents.findCalendars();
        console.log('getCalendarAsync(): calendars found = ', calendars);

        // Save calendars in context
        Schemas.CreateContext('CALENDARS', JSON.stringify(calendars));

        // Define date range: today to 7 days ahead
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + 7);

        // Extract calendar IDs
        const calendarIds = calendars.map(calendar => String(calendar.id));

        console.log('getCalendarAsync(): fetching events...');

        // Fetch events for the week from all calendars
        const events = await RNCalendarEvents.fetchAllEvents(start, end, calendarIds);
        console.log('getCalendarAsync(): events = ', events);

        // Save events in context
        Schemas.CreateContext('EVENTS', JSON.stringify(events));
        console.log('getCalendarAsync(): END');
      } else {
        console.warn('getCalendarAsync(): permission denied');
      }
    } catch (error) {
      console.error('getCalendarAsync(): ERROR', error);
    }
  };
