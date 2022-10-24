import { calendar_v3, google } from 'googleapis';

import Schema$Event = calendar_v3.Schema$Event;
import { dateString, getAppointmentString, getDateString, getWeekString } from './Functions';
import { GoogleCalendar } from '../api';
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;

const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

export interface CalendarConfigProps {
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_CALENDAR_ID: string;
}

export interface GoogleCalendarEvent {
  id: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  start: Schema$EventDateTime | undefined;
  end: Schema$EventDateTime | undefined;
}

export interface Appointment {
  start: string;
  end: string;
}

export interface CalendarDay {
  start: string;
  end: string;
  slots: Appointment[];
}

export interface CalendarWeek {
  weekString: string;
  start: string;
  end: string;
  week: number;
  days: CalendarDay[];
}

/**
 * Get the minutes between 2 date strings
 */
function getMinutesBetween(first: string, second: string) {
  return dayjs(second).diff(first, 'minute');
}

// /**
//  * Check if that day is available
//  * @param day
//  */
// export function checkDayAvailable(day: CalendarDay) {
//   //, timeBetweenAppointments: number, appointmentDuration: number
//   //if there are no slots,
//   //day is not available
//
//   // if(day.slots.length > 0) {
//   //   return true;
//   // } else {
//   //   return false;
//   // }
//
//   return
//
//   // for (let i = 0; i < day.slots.length; i++) {
//   //
//   // }
//   //
//   // if (day.slots.length > 0) {
//   //   // for each slot
//   //   for (let i = 0; i < day.slots.length; i++) {
//   //     //get the appointment
//   //     const appointment = day.slots[i];
//   //
//   //     if (i === 0) {
//   //       //this is the first appointment
//   //
//   //       //get the time between the start of the day and the start of the appointment
//   //       const first = dayjs(day.start).add(timeBetweenAppointments, 'minute');
//   //       const second = dayjs(appointment.start).add(-timeBetweenAppointments, 'minute');
//   //       const minutesBetween = getMinutesBetween(first, second);
//   //
//   //       //if that is greater than appointmentDuration return true else continue
//   //       if (minutesBetween > appointmentDuration) {
//   //         return true;
//   //       }
//   //     }
//   //
//   //     // check if there is a next appointment
//   //     if (day.slots.length > i + 1) {
//   //       //there is a next appointment
//   //       const nextAppointment = day.slots[i + 1];
//   //
//   //       //get the minutes between the end of the first appointment and the start of the next appointment
//   //       const first = dayjs(appointment.end).add(timeBetweenAppointments, 'minute');
//   //       const second = dayjs(nextAppointment.start).add(-timeBetweenAppointments, 'minute');
//   //       const minutesBetween = getMinutesBetween(first, second);
//   //
//   //       //if that is greater than appointmentDuration return true else continue
//   //       if (minutesBetween > appointmentDuration) {
//   //         return true;
//   //       }
//   //
//   //       //if that is greater than appointmentDuration return true else continue
//   //     } else {
//   //       //get the minutes between the end of the appointment and the end of the day
//   //       const first = dayjs(appointment.end).add(timeBetweenAppointments, 'minute');
//   //       const second = dayjs(day.end).add(-timeBetweenAppointments, 'minute');
//   //       const minutesBetween = getMinutesBetween(first, second);
//   //
//   //       //if that is greater than appointmentDuration return true else continue
//   //
//   //       if (minutesBetween > appointmentDuration) {
//   //         return true;
//   //       }
//   //     }
//   //   }
//   // } else {
//   //   // there are no appointments so the whole day is available
//   //   return true;
//   // }
//   // return false;
// }

/**
 * Check if the week is available
 * @param weekData
 */
export function checkWeekAvailable(weekData: CalendarDay[]) {
  let availableBool = false;

  weekData.forEach((day) => {
    //foreach day in the week, check if that day is available, if one of them is true, then week is available. else week is not available
    const available = day.slots.length > 0;
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
export async function getAvailableWeeks(
  config: CalendarConfigProps,
  appointmentDuration: number,
  timeBetweenAppointments: number,
) {
  const currentWeek = dayjs().isoWeek();
  let weekIndex = 0;
  const availableWeeks: CalendarWeek[] = [];

  while (availableWeeks.length < 6) {
    const weekNum = dayjs()
      .isoWeek(currentWeek + weekIndex)
      .startOf('isoWeek')
      .isoWeek();

    //TODO:
    //getWeekData
    const weekEvents = await getWeekEvents(config, weekNum);
    if (weekEvents) {
      //checkWeekAvailable
      const weekAsDay = sortEventByDay(weekEvents, appointmentDuration, timeBetweenAppointments);

      const available = checkWeekAvailable(weekAsDay);

      if (available) {
        //this week is available
        const startOfWeek = dayjs().isoWeek(weekNum).startOf('isoWeek').format();
        const endOfWeek = dayjs().isoWeek(weekNum).endOf('isoWeek').format();

        availableWeeks.push({
          weekString: getWeekString(startOfWeek, endOfWeek),
          start: startOfWeek,
          end: endOfWeek,
          week: weekNum,
          days: weekAsDay,
        });
      }
      weekIndex++;
      //else week is not available so continue
    } else {
      console.error('no calendar events available');
    }

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
  return availableWeeks;
}

async function getSortedEvents(
  calendar: GoogleCalendar,
  weekNumber: number,
  passedDownEvents: GoogleCalendarEvent[] | [] = [],
  pageToken: string | undefined = undefined,
): Promise<any[]> {
  const newEvents: GoogleCalendarEvent[] | [] = passedDownEvents ? passedDownEvents : [];

  const timeMin = dayjs().isoWeek(weekNumber).startOf('week').format();
  const timeMax = dayjs().isoWeek(weekNumber).endOf('week').format();

  let nextPageToken = null;

  const event = await calendar.getEvents(timeMin, timeMax, 'UTC', {
    maxResults: 25,
    pageToken: pageToken ? pageToken : '',
  });

  if (event.data.items) {
    event.data.items.forEach((item) => {
      newEvents.push({
        id: item.id,
        title: item.summary,
        description: item.description,
        start: item.start,
        end: item.end,
      });
    });
  }

  if (event.data.nextPageToken) {
    nextPageToken = event.data.nextPageToken;
  }

  if (!nextPageToken) {
    //sortEvents();

    //sort the events (events) => [day[]]
    //for each timeSlot => find the events
    return newEvents;
  }

  return await getSortedEvents(calendar, weekNumber, newEvents, nextPageToken);
}

/**
 * Get the events from the Google Calendar that are in the given weekNumber
 * @param calendarConfig
 * @param weekNum
 */
export async function getWeekEvents(calendarConfig: CalendarConfigProps, weekNum: number) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = calendarConfig;

  const calendar = new GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);

  return await getSortedEvents(calendar, weekNum);
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
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = calendarConfig;

  const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY,
    'https://www.googleapis.com/auth/calendar',
  );

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
 * sort the event into a day object.
 */
export function sortEventByDay(
  events: GoogleCalendarEvent[],
  appointmentDuration: number,
  timeBetweenAppointments: number,
) {
  const timeSlots: GoogleCalendarEvent[] = [];

  const days: CalendarDay[] = [];

  //returns array of days

  // sort the items
  events.forEach((event: GoogleCalendarEvent) => {
    if ((event.title || '').toLowerCase() === 'Beschikbaar'.toLowerCase()) {
      timeSlots.push(event);
    }
  });

  timeSlots.forEach((timeSlot) => {
    //events => slots
    days.push({
      start: timeSlot.start?.dateTime || '',
      end: timeSlot.end?.dateTime || '',
      slots: getSlotsForDay(events, timeSlot, appointmentDuration, timeBetweenAppointments),
    });
  });

  return days;
}

/**
 * Returns the slots for a given timeSlot(day)
 */
export function getSlotsForDay(
  appointments: GoogleCalendarEvent[],
  timeSlot: GoogleCalendarEvent,
  appointmentDuration: number,
  timeBetweenAppointments: number,
) {
  const filtered = appointments.filter(
    (appointment) =>
      dayjs(appointment.end?.dateTime).format('DD/MM/YYYY') === dayjs(timeSlot.start?.dateTime).format('DD/MM/YYYY') &&
      appointment.title !== 'Beschikbaar',
  );

  const slots = getAvailableSlotsForDay(filtered, timeSlot, appointmentDuration, timeBetweenAppointments);

  // const appointmentsAsAppointment: Appointment[] = filtered.map((appointment) => {
  //   return {
  //     start: appointment.start?.dateTime || '',
  //     end: appointment.end?.dateTime || '',
  //   };
  // });

  return slots;
}

/**
 * Get the available time for that day
 * @param appointmentsToday
 * @param timeSlot
 * @param timeBetweenAppointments
 */
function getAvailableTimeForDay(
  appointmentsToday: GoogleCalendarEvent[],
  timeSlot: GoogleCalendarEvent,
  timeBetweenAppointments: number,
) {
  const availableTimeToday: any[] = [];

  if (appointmentsToday.length > 0) {
    for (let i = 0; i < appointmentsToday.length; i++) {
      const selectedAppointment = appointmentsToday[i];
      let nextSelected = null;

      if (i === 0) {
        if (timeSlot.start?.dateTime && selectedAppointment.start?.dateTime) {
          const minutes = getMinutesBetween(timeSlot.start.dateTime, selectedAppointment.start.dateTime);
          if (minutes > 0) {
            availableTimeToday.push({
              startTime: timeSlot.start.dateTime,
              minutesBetween: minutes,
              endTime: selectedAppointment.start.dateTime,
            });
          }
        }
      }

      if (appointmentsToday.length >= i + 1) {
        nextSelected = appointmentsToday[i + 1];
      }

      if (nextSelected) {
        if (nextSelected.start?.dateTime && selectedAppointment.end?.dateTime) {
          const minutes = getMinutesBetween(selectedAppointment.end.dateTime, nextSelected.start.dateTime);

          if (minutes > 0) {
            availableTimeToday.push({
              startTime: dayjs(selectedAppointment.end.dateTime).add(timeBetweenAppointments, 'minute').format(),
              minutesBetween: minutes - timeBetweenAppointments,
              endTime: dayjs(nextSelected.start.dateTime).format(),
            });
          }
        }
      } else {
        if (selectedAppointment.end?.dateTime && timeSlot.end?.dateTime) {
          const minutes = getMinutesBetween(selectedAppointment.end.dateTime, timeSlot.end.dateTime);

          if (minutes > 0) {
            availableTimeToday.push({
              startTime: selectedAppointment.end.dateTime,
              minutesBetween: minutes,
              endTime: timeSlot.end.dateTime,
            });
          }
        }
      }
    }
  } else {
    if (timeSlot.start?.dateTime && timeSlot.end?.dateTime) {
      const minutes = getMinutesBetween(timeSlot.start.dateTime, timeSlot.end.dateTime);

      availableTimeToday.push({
        startTime: timeSlot.start.dateTime,
        getMinutesBetween: minutes,
        endTime: timeSlot.end.dateTime,
      });
    }
  }

  return availableTimeToday;
}

/**
 * Return all available slots for today
 */
function getAvailableSlotsForDay(
  appointmentsToday: GoogleCalendarEvent[],
  timeSlot: GoogleCalendarEvent,
  appointmentDuration: number,
  timeBetweenAppointments: number,
) {
  const availableSlotsToday: Appointment[] = [];

  const availableTimeToday = getAvailableTimeForDay(appointmentsToday, timeSlot, timeBetweenAppointments);

  availableTimeToday.forEach((availableTime) => {
    let newAppointmentStartTime = dayjs(availableTime.startTime);
    let newAppointmentEndTime = dayjs(availableTime.startTime).add(appointmentDuration, 'minute');

    while (newAppointmentStartTime.isBefore(availableTime.endTime)) {
      if (newAppointmentEndTime.isBefore(availableTime.endTime)) {
        availableSlotsToday.push({
          start: newAppointmentStartTime.format(),
          end: newAppointmentEndTime.format(),
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

////// Old ////////
//
// /**
//  * Returns all available slots
//  */
// export function getAvailableSlotsTotal(
//   timeSlots: any[],
//   appointments: any[],
//   timeBetweenAppointments: number,
//   appointmentDuration: number,
// ) {
//   const allSlots: any[] = [];
//
//   timeSlots.forEach((timeSlot) => {
//     const appointmentsToday = getAppointmentsForTimeSlot(appointments, timeSlot);
//
//     const availableTimeToday = getAvailableTimeForDay(appointmentsToday, timeSlot, timeBetweenAppointments);
//
//     // const availableSlotsToday = getAvailableSlotsToday(
//     //   availableTimeToday,
//     //   appointmentDuration,
//     //   timeBetweenAppointments,
//     // );
//
//     availableSlotsToday.forEach((slot: any) => {
//       if (dayjs(slot.startTime).isAfter(dayjs())) {
//         allSlots.push({
//           fullString: getAppointmentString(slot.startTime, slot.endTime, 'nl-NL'),
//           startDate: slot.startTime,
//           endDate: slot.endTime,
//         });
//       }
//     });
//   });
//   return allSlots;
// }
// //OLD
// // /**
// //  * Get the available weeks
// //  */
// // export function getAvailableWeeks(allSlots: any[]) {
// //   const weeks: any = {};
// //
// //   allSlots.forEach((slot) => {
// //     const date = dayjs(slot.startDate);
// //     const weekNum = date.isoWeek();
// //
// //     weeks[weekNum] = {
// //       title: `week ${weekNum}`,
// //       startDate: date.startOf('isoWeek').format(),
// //       description: `${getDateString(date.startOf('isoWeek').format())} tot ${getDateString(
// //         date.endOf('isoWeek').format(),
// //       )}`,
// //       number: weekNum,
// //     };
// //   });
// //
// //   return weeks;
// // }
// //
// // /**
// //  * Get the days of the week that are available
// //  */
// // export function getDaysByWeek(allSlots: any[], weekNumber: number) {
// //   const days: any[] = [];
// //
// //   allSlots.forEach((slot) => {
// //     const day = dateString(slot.startDate, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'full' });
// //     const weekNum = dayjs(slot.startDate).isoWeek();
// //
// //     if (weekNum === weekNumber) {
// //       if (days.find((d) => d.parsedDate === day)) {
// //       } else {
// //         days.push({
// //           parsedDate: day,
// //           actualDate: dayjs(slot.startDate).format('DD/MM/YYYY'),
// //         });
// //       }
// //     }
// //   });
// //
// //   return days;
// // }
// //
// // /**
// //  * Get the appointments by day
// //  */
// // export function getAppointmentsByDay(allSlots: any[], date: string) {
// //   const days: any[] = [];
// //
// //   allSlots.forEach((slot) => {
// //     const day = dayjs(slot.startDate).format('DD/MM/YYYY');
// //
// //     if (day === date) {
// //       if (days.length < 9) {
// //         days.push(slot);
// //       }
// //     }
// //   });
// //
// //   return days;
// // }
/// OLD

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
