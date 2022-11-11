import { calendar_v3 } from 'googleapis';

import { getAppointmentString, getMinutesBetween, getWeekString } from './Functions';
import { GoogleCalendar } from '../api';
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;

import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';

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
  timeInAdvance: number,
) {
  let weekIndex = 0;
  const availableWeeks: CalendarWeek[] = [];

  while (availableWeeks.length < 8) {
    console.log(weekIndex);

    //if the calculated week number is greater then 52, set it to the next year, week 1

    const weekEvents = await getWeekEvents(config, weekIndex);

    if (weekEvents) {
      //checkWeekAvailable
      const weekAsDay = sortEventByDay(weekEvents, appointmentDuration, timeBetweenAppointments, timeInAdvance);

      const available = checkWeekAvailable(weekAsDay);

      if (available) {
        //this week is available
        const startOfWeek = dayjs().add(weekIndex, 'week').startOf('isoWeek').format();
        const endOfWeek = dayjs().add(weekIndex, 'week').endOf('isoWeek').format();

        availableWeeks.push({
          weekString: getWeekString(startOfWeek, endOfWeek),
          start: startOfWeek,
          end: endOfWeek,
          week: dayjs(startOfWeek).isoWeek(),
          days: weekAsDay,
        });
      }
      weekIndex++;
      //else week is not available so continue
    } else {
      console.error('no calendar events available');
    }
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

  const timeMin = dayjs().add(weekNumber, 'week').startOf('week').format();
  const timeMax = dayjs().add(weekNumber, 'week').endOf('week').format();

  let nextPageToken = null;

  const event = await calendar.getEvents(timeMin, timeMax, 'UTC', {
    maxResults: 25,
    pageToken: pageToken ? pageToken : '',
  });

  if (event.data.items) {
    event.data.items.forEach((item) => {
      //if date is greater than current date
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
  startDate: string,
  endDate: string,
  title: string,
  description = '',
) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = calendarConfig;

  const calendar = new GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);

  const event = {
    summary: title,
    description: description.replace(/\\n/g, '\n'),
    start: {
      dateTime: dayjs(startDate).format(),
    },
    end: {
      dateTime: dayjs(endDate).format(),
    },
  };

  const calEvent = await calendar.createEvent(event);

  //const eventEId = calEvent.data.htmlLink?.replace('https://www.google.com/calendar/event?eid=', '');
  const eventId = calEvent.data.id;

  return {
    appointmentString: getAppointmentString(startDate, endDate, 'nl-NL'),
    //eventEid,
    eventId,
  };
}

/**
 * sort the event into a day object.
 */
export function sortEventByDay(
  events: GoogleCalendarEvent[],
  appointmentDuration: number,
  timeBetweenAppointments: number,
  timeInAdvance: number,
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
      slots: getSlotsForDay(events, timeSlot, appointmentDuration, timeBetweenAppointments, timeInAdvance),
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
  timeInAdvance: number,
) {
  const filtered = appointments.filter(
    (appointment) =>
      dayjs(appointment.end?.dateTime).format('DD/MM/YYYY') === dayjs(timeSlot.start?.dateTime).format('DD/MM/YYYY') &&
      appointment.title !== 'Beschikbaar',
  );

  //slots that are available for the given day
  const slots = getAvailableSlotsForDay(filtered, timeSlot, appointmentDuration, timeBetweenAppointments);

  //return all the slots that are after right now (to exclude past slots) and the time offset.
  return slots.filter((slot) => dayjs(slot.start).isAfter(dayjs().add(timeInAdvance, 'minutes').format()));
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

  //if appointments exist
  if (appointmentsToday.length > 0) {
    //for each appointment
    for (let i = 0; i < appointmentsToday.length; i++) {
      const selectedAppointment = appointmentsToday[i];
      let nextSelected = null;

      //if appointment is first appointment of the day
      if (i === 0) {
        if (timeSlot.start?.dateTime && selectedAppointment.start?.dateTime) {
          const minutes = getMinutesBetween(timeSlot.start.dateTime, selectedAppointment.start.dateTime);

          if (minutes > 0) {
            availableTimeToday.push({
              startTime: dayjs(timeSlot.start.dateTime).format(),
              minutesBetween: minutes,
              endTime: dayjs(selectedAppointment.start.dateTime).add(-timeBetweenAppointments, 'minute').format(),
            });
          }
        }
      }

      //if another appointment exists
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
              endTime: dayjs(nextSelected.start.dateTime).add(-timeBetweenAppointments, 'minute').format(),
            });
          }
        }
      } else {
        //if not this is not the first appointment and there is no next appointment, this must be the last appointment
        if (selectedAppointment.end?.dateTime && timeSlot.end?.dateTime) {
          const minutes = getMinutesBetween(selectedAppointment.end.dateTime, timeSlot.end.dateTime);

          if (minutes > 0) {
            availableTimeToday.push({
              startTime: dayjs(selectedAppointment.end.dateTime).add(timeBetweenAppointments, 'minute').format(),
              minutesBetween: minutes,
              endTime: dayjs(timeSlot.end.dateTime).format(),
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

/**
 * Finds the corresponding date and returns it
 */
export function findDate(weeks: CalendarWeek[], date: string, timeRange: string) {
  const day = parseInt(date.split('-')[0]);
  const month = parseInt(date.split('-')[1]);
  const year = parseInt(date.split('-')[2]);

  const startTime = timeRange.split('-')[0];
  const endTime = timeRange.split('-')[1];

  const startTimeHour = parseInt(startTime.split(':')[0]);
  const startTimeMinute = parseInt(startTime.split(':')[1]);
  const endTimeHour = parseInt(endTime.split(':')[0]);
  const endTimeMinute = parseInt(endTime.split(':')[1]);

  const initialDate = new Date(`${month}/${day}/${year}`);

  const startDateTime = new Date(initialDate.setHours(startTimeHour, startTimeMinute));

  const endDateTime = new Date(initialDate.setHours(endTimeHour, endTimeMinute));

  const string = getAppointmentString(startDateTime.toString(), endDateTime.toString(), 'nl-NL');

  console.log('str', string);

  const slots: any[] = [];

  weeks.forEach((week) => {
    week.days.forEach((day) => {
      day.slots.forEach((slot) => {
        slots.push({
          parsedString: getAppointmentString(slot.start, slot.end, 'nl-NL'),
          start: slot.start,
          end: slot.end,
        });
      });
    });
  });

  const found = slots.find((slot) => slot.parsedString === string);

  if (found) {
    return {
      start: found.start,
      end: found.end,
    };
  } else {
    return {
      start: 'not_found',
      end: 'not_found',
    };
  }
}

/**
 * Cancels the given event
 */
export async function cancelEvent(calendarConfig: CalendarConfigProps, eventId: string) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = calendarConfig;

  const calendar = new GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);

  return await calendar.deleteEvent(eventId);
}

/**
 * Moves the given event to the given dates
 */
export async function moveEvent(
  calendarConfig: CalendarConfigProps,
  eventId: string,
  newStartDate: string,
  newEndDate: string,
) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = calendarConfig;

  const calendar = new GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);

  const event = await calendar.getEvent(eventId);

  let eventData = event.data;

  eventData.start.dateTime = newStartDate;
  eventData.end.dateTime = newEndDate;

  return await calendar.updateEvent(eventId, eventData);
}
