import { calendar_v3, google } from 'googleapis';

import Schema$Event = calendar_v3.Schema$Event;
import { dateString, getAppointmentString, getDateString } from './Functions';
import { GoogleCalendar } from '../api';
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;

const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

export interface CalendarConfigProps {
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_CALENDAR_ID: string;
  SCOPES: string;
}

// export interface GoogleCalendarEvent {
//   id: string | null | undefined;
//   title: string | null | undefined;
//   description: string | null | undefined;
//   start: Schema$EventDateTime | undefined;
//   end: Schema$EventDateTime | undefined;
// }

export interface TimeSlot {
  start: string;
  end: string;
}

export interface CalendarDay {
  start: string;
  end: string;
  appointments: TimeSlot[];
}

/**
 * Get the minutes between 2 date strings
 */
function getMinutesBetween(first: string, second: string) {
  return dayjs(second).diff(first, 'minute');
}

/**
 * Check if that day is available
 * @param day
 * @param timeBetweenAppointments
 * @param appointmentDuration
 */
export function checkDayAvailable(day: CalendarDay, timeBetweenAppointments: number, appointmentDuration: number) {
  if (day.appointments.length > 0) {
    // for each appointment
    for (let i = 0; i < day.appointments.length; i++) {
      //get the appointment
      const appointment = day.appointments[i];

      if (i === 0) {
        //this is the first appointment

        //get the time between the start of the day and the start of the appointment
        const first = dayjs(day.start).add(timeBetweenAppointments, 'minute');
        const second = dayjs(appointment.start).add(-timeBetweenAppointments, 'minute');
        const minutesBetween = getMinutesBetween(first, second);

        //if that is greater than appointmentDuration return true else continue
        if (minutesBetween > appointmentDuration) {
          return true;
        }
      }

      // check if there is a next appointment
      if (day.appointments.length > i + 1) {
        //there is a next appointment
        const nextAppointment = day.appointments[i + 1];

        //get the minutes between the end of the first appointment and the start of the next appointment
        const first = dayjs(appointment.end).add(timeBetweenAppointments, 'minute');
        const second = dayjs(nextAppointment.start).add(-timeBetweenAppointments, 'minute');
        const minutesBetween = getMinutesBetween(first, second);

        //if that is greater than appointmentDuration return true else continue
        if (minutesBetween > appointmentDuration) {
          return true;
        }

        //if that is greater than appointmentDuration return true else continue
      } else {
        //get the minutes between the end of the appointment and the end of the day
        const first = dayjs(appointment.end).add(timeBetweenAppointments, 'minute');
        const second = dayjs(day.end).add(-timeBetweenAppointments, 'minute');
        const minutesBetween = getMinutesBetween(first, second);

        //if that is greater than appointmentDuration return true else continue

        if (minutesBetween > appointmentDuration) {
          return true;
        }
      }
    }
  } else {
    // there are no appointments so the whole day is available
    return true;
  }
  return false;
}

/**
 * Check if the week is available
 * @param weekData
 * @param timeBetweenAppointments
 * @param appointmentDuration
 */
export function checkWeekAvailable(
  weekData: CalendarDay[],
  timeBetweenAppointments: number,
  appointmentDuration: number,
) {
  let availableBool = false;

  weekData.forEach((day) => {
    //foreach day in the week, check if that day is available, if one of them is true, then week is available. else week is not available
    const available = checkDayAvailable(day, timeBetweenAppointments, appointmentDuration);
    if (available) {
      availableBool = true;
    }
  });

  // else week is not available
  return availableBool;
}

/**
 * Get the 6 next available weeks
 */
export function getAvailableWeeks() {
  const currentWeek = dayjs().isoWeek();
  const availableWeeks: CalendarDay[][] = [];

  while (availableWeeks.length < 5) {
    const week = dayjs(currentWeek).add(availableWeeks.length, 'week');

    const startOfWeek = dayjs(week).startOf('week').format();
    const endOfWeek = dayjs(week).endOf('week').format();

    //TODO:
    //get week data (startOfWeek, endOfWeek);
    //if week data exists:

    //check availability.
    //IF AVAILABLE
    //add to available array
    //add 1 week
    //IF NOT AVAILABLE
    //add 1 week

    //if week data does not exist:
    //add 1 week
  }
}
//OLD
// export async function GetPaginatedEvents(
//   calendar: GoogleCalendar,
//   timeMin: string,
//   timeMax: string,
//   passedDownEvents: GoogleCalendarEvent[] | [] = [],
//   pageToken: string | undefined = undefined,
// ): Promise<any[]> {
//   const newEvents: GoogleCalendarEvent[] | [] = passedDownEvents ? passedDownEvents : [];
//
//   let nextPageToken = pageToken;
//
//   const event = await calendar.getEvents(timeMin, timeMax, 'UTC', {
//     maxResults: 25,
//     pageToken: nextPageToken,
//   });
//
//   if (event.data.items) {
//     event.data.items.forEach((item) => {
//       newEvents.push({
//         id: item.id,
//         title: item.summary,
//         description: item.description,
//         start: item.start,
//         end: item.end,
//       });
//     });
//   }
//
//   if (event.data.nextPageToken) {
//     nextPageToken = event.data.nextPageToken;
//   }
//
//   if (!nextPageToken) {
//     return newEvents;
//   }
//
//   return await GetPaginatedEvents(calendar, timeMin, timeMax, newEvents, nextPageToken);
// }
/**
 * Get all the events from the Google calendar
 */
export async function getCalendarEvents(calendarConfig: CalendarConfigProps, timeMin: string, timeMax: string) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID, SCOPES } = calendarConfig;

  const calendar = new GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);

  return 0; //await GetPaginatedEvents(calendar, timeMin, timeMax);
}

/**
 * Create calendar appointment
 */
export async function makeCalendarEvent(
  calendarConfig: CalendarConfigProps,
  date: string,
  timeRange: string,
  displayName: string,
  phoneNumber: string,
) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID, SCOPES } = calendarConfig;

  const jwtClient = new google.auth.JWT(GOOGLE_CLIENT_EMAIL, undefined, GOOGLE_PRIVATE_KEY, SCOPES);

  const calendar = google.calendar({
    version: 'v3',
    auth: jwtClient,
  });

  const day = parseInt(date.split('/')[0]);
  const month = parseInt(date.split('/')[1]);
  const year = parseInt(date.split('/')[2]);

  const startTime = timeRange.split('-')[0];
  const endTime = timeRange.split('-')[1];

  const startTimeHour = parseInt(startTime.split(':')[0]);
  const startTimeMinute = parseInt(startTime.split(':')[1]);
  const endTimeHour = parseInt(endTime.split(':')[0]);
  const endTimeMinute = parseInt(endTime.split(':')[1]);

  const initialDate = new Date(`${month}/${day}/${year}`);

  const startDateTime = new Date(initialDate.setHours(startTimeHour, startTimeMinute));

  const endDateTime = new Date(initialDate.setHours(endTimeHour, endTimeMinute));

  const event = {
    summary: `Afspraak met ${displayName}`,
    start: {
      //dateTime: dayjs(startDateTime).utc().tz("Europe/Amsterdam").format()
      dateTime: dayjs(startDateTime).add(-2, 'hour').format(),
    },
    end: {
      //dateTime: dayjs(endDateTime).utc().tz("Europe/Amsterdam").format()
      dateTime: dayjs(endDateTime).add(-2, 'hour').format(),
    },
    description: `Afspraak gemaakt door ${displayName} met telefoonnummer ${phoneNumber}`,
  };

  calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    requestBody: event,
  });

  return getAppointmentString(startDateTime.toISOString(), endDateTime.toISOString(), 'nl-NL');
}

/**
 * Sort the events into Slots and Appointments
 */
export function sortEvents(events: Schema$Event[]) {
  const timeSlots: any[] = [];
  const appointments: any[] = [];

  events.forEach((event: any) => {
    if (event.summary.toLowerCase() === 'Beschikbaar'.toLowerCase()) {
      timeSlots.push({
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
      });
    } else {
      appointments.push({
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
      });
    }
  });
  return {
    timeSlots,
    appointments,
  };
}

/**
 * Returns the appointments for today (not available)
 */
function getAppointmentsForTimeSlot(appointments: any[], timeSlot: any) {
  return appointments.filter(
    (appointment) => dayjs(appointment.end).format('DD/MM/YYYY') === dayjs(timeSlot.start).format('DD/MM/YYYY'),
  );
}

// /**
//  * Sort the appointments to date
//  */
// export function sortAvailabilityAndAppointments(items: any[]) {
//   const newEvents: any = {};
//
//   items.forEach((item) => {
//     const date = dayjs(item.start.dateTime).format('DD/MM/YYYY');
//
//     if (newEvents[date]) {
//       //is appointment
//       newEvents[date].appointments = [
//         ...(newEvents[date].appointments ? newEvents[date].appointments : []),
//         {
//           id: item.id,
//           title: item.summary,
//           description: item.description,
//           start: item.start.dateTime,
//           end: item.end.dateTime,
//         },
//       ];
//     } else {
//       //is timeSlot
//       newEvents[date] = {
//         start: item.start.dateTime,
//         end: item.end.dateTime,
//         appointments: [],
//       };
//     }
//   });
//
//   return newEvents;
// }
//
// /**
//  * Get the available time for the given day
//  */
// function getAvailableTimeDay(today: any[], timeBetweenAppointments: number) {}

/**
 * Get the available time for that day
 */
function getAvailableTimeToday(appointmentsToday: any[], timeSlot: any, timeBetweenAppointments: number) {
  const availableTimeToday: any[] = [];

  if (appointmentsToday.length > 0) {
    for (let i = 0; i < appointmentsToday.length; i++) {
      const selectedAppointment = appointmentsToday[i];
      let nextSelected = null;

      if (i === 0) {
        const minutes = getMinutesBetween(timeSlot.start, selectedAppointment.start);
        if (minutes > 0) {
          availableTimeToday.push({
            startTime: timeSlot.start,
            minutesBetween: minutes,
            endTime: selectedAppointment.start,
          });
        }
      }

      if (appointmentsToday.length >= i + 1) {
        nextSelected = appointmentsToday[i + 1];
      }

      if (nextSelected) {
        const minutes = getMinutesBetween(selectedAppointment.end, nextSelected.start);

        if (minutes > 0) {
          availableTimeToday.push({
            startTime: dayjs(selectedAppointment.end).add(timeBetweenAppointments, 'minute').format(),
            minutesBetween: minutes - timeBetweenAppointments,
            endTime: dayjs(nextSelected.start).format(),
          });
        }
      } else {
        const minutes = getMinutesBetween(selectedAppointment.end, timeSlot.end);

        if (minutes > 0) {
          availableTimeToday.push({
            startTime: selectedAppointment.end,
            minutesBetween: minutes,
            endTime: timeSlot.end,
          });
        }
      }
    }
  } else {
    const minutes = getMinutesBetween(timeSlot.start, timeSlot.end);

    availableTimeToday.push({
      startTime: timeSlot.start,
      getMinutesBetween: minutes,
      endTime: timeSlot.end,
    });
  }

  return availableTimeToday;
}

/**
 * Return all available slots for today
 */
function getAvailableSlotsToday(
  availableTimeToday: any[],
  appointmentDuration: number,
  timeBetweenAppointments: number,
) {
  const availableSlotsToday: any[] = [];

  availableTimeToday.forEach((availableTime) => {
    let newAppointmentStartTime = dayjs(availableTime.startTime);
    let newAppointmentEndTime = dayjs(availableTime.startTime).add(appointmentDuration, 'minute');

    while (newAppointmentStartTime.isBefore(availableTime.endTime)) {
      if (newAppointmentEndTime.isBefore(availableTime.endTime)) {
        availableSlotsToday.push({
          startTime: newAppointmentStartTime.format(),
          endTime: newAppointmentEndTime.format(),
        });
      }

      newAppointmentStartTime = dayjs(newAppointmentStartTime).add(
        appointmentDuration + timeBetweenAppointments,
        'minute',
      );
      newAppointmentEndTime = dayjs(newAppointmentEndTime).add(appointmentDuration + timeBetweenAppointments, 'minute');
    }
  });

  return availableSlotsToday;
}

/**
 * Returns all available slots
 */
export function getAvailableSlotsTotal(
  timeSlots: any[],
  appointments: any[],
  timeBetweenAppointments: number,
  appointmentDuration: number,
) {
  const allSlots: any[] = [];

  timeSlots.forEach((timeSlot) => {
    const appointmentsToday = getAppointmentsForTimeSlot(appointments, timeSlot);

    const availableTimeToday = getAvailableTimeToday(appointmentsToday, timeSlot, timeBetweenAppointments);

    const availableSlotsToday = getAvailableSlotsToday(
      availableTimeToday,
      appointmentDuration,
      timeBetweenAppointments,
    );

    availableSlotsToday.forEach((slot: any) => {
      if (dayjs(slot.startTime).isAfter(dayjs())) {
        allSlots.push({
          fullString: getAppointmentString(slot.startTime, slot.endTime, 'nl-NL'),
          startDate: slot.startTime,
          endDate: slot.endTime,
        });
      }
    });
  });
  return allSlots;
}
//OLD
// /**
//  * Get the available weeks
//  */
// export function getAvailableWeeks(allSlots: any[]) {
//   const weeks: any = {};
//
//   allSlots.forEach((slot) => {
//     const date = dayjs(slot.startDate);
//     const weekNum = date.isoWeek();
//
//     weeks[weekNum] = {
//       title: `week ${weekNum}`,
//       startDate: date.startOf('isoWeek').format(),
//       description: `${getDateString(date.startOf('isoWeek').format())} tot ${getDateString(
//         date.endOf('isoWeek').format(),
//       )}`,
//       number: weekNum,
//     };
//   });
//
//   return weeks;
// }
//
// /**
//  * Get the days of the week that are available
//  */
// export function getDaysByWeek(allSlots: any[], weekNumber: number) {
//   const days: any[] = [];
//
//   allSlots.forEach((slot) => {
//     const day = dateString(slot.startDate, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'full' });
//     const weekNum = dayjs(slot.startDate).isoWeek();
//
//     if (weekNum === weekNumber) {
//       if (days.find((d) => d.parsedDate === day)) {
//       } else {
//         days.push({
//           parsedDate: day,
//           actualDate: dayjs(slot.startDate).format('DD/MM/YYYY'),
//         });
//       }
//     }
//   });
//
//   return days;
// }
//
// /**
//  * Get the appointments by day
//  */
// export function getAppointmentsByDay(allSlots: any[], date: string) {
//   const days: any[] = [];
//
//   allSlots.forEach((slot) => {
//     const day = dayjs(slot.startDate).format('DD/MM/YYYY');
//
//     if (day === date) {
//       if (days.length < 9) {
//         days.push(slot);
//       }
//     }
//   });
//
//   return days;
// }
