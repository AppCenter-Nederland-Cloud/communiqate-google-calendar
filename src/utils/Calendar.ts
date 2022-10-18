import {calendar_v3, google} from 'googleapis';

import Schema$Event = calendar_v3.Schema$Event;
import {dateString, getAppointmentString, getDateString} from "./Functions";

const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);


export interface CalendarConfigProps {
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_CALENDAR_ID: string;
    SCOPES: string;
}

/**
 * Get all the events from the Google calendar
 */
export async function getCalendarEvents(calendarConfig: CalendarConfigProps, timeMin: string, timeMax: string) {
    const {
        GOOGLE_CLIENT_EMAIL,
        GOOGLE_PRIVATE_KEY,
        GOOGLE_CALENDAR_ID,
        SCOPES,
    } = calendarConfig;

    const jwtClient = new google.auth.JWT(
        GOOGLE_CLIENT_EMAIL,
        undefined,
        GOOGLE_PRIVATE_KEY,
        SCOPES
    );

    const calendar = google.calendar({
        version: "v3",
        auth: jwtClient,
    });


    const { data } = await calendar.events.list({
        calendarId: GOOGLE_CALENDAR_ID,
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: 500,
        timeZone: "UTC",
        singleEvents: true,
        orderBy: "startTime",
    });

    return data.items;
}

/**
 * Create calendar appointment
 */
export async function makeCalendarEvent(calendarConfig: CalendarConfigProps, date: string, timeRange: string, displayName: string, phoneNumber: string) {
    const {
        GOOGLE_CLIENT_EMAIL,
        GOOGLE_PRIVATE_KEY,
        GOOGLE_CALENDAR_ID,
        SCOPES,
    } = calendarConfig;

    const jwtClient = new google.auth.JWT(
        GOOGLE_CLIENT_EMAIL,
        undefined,
        GOOGLE_PRIVATE_KEY,
        SCOPES
    );

    const calendar = google.calendar({
        version: "v3",
        auth: jwtClient,
    });


    const day = parseInt(date.split("/")[0]);
    const month = parseInt(date.split("/")[1]);
    const year = parseInt(date.split("/")[2]);

    const startTime = timeRange.split("-")[0];
    const endTime = timeRange.split("-")[1];

    const startTimeHour = parseInt(startTime.split(":")[0]);
    const startTimeMinute = parseInt(startTime.split(":")[1]);
    const endTimeHour = parseInt(endTime.split(":")[0]);
    const endTimeMinute = parseInt(endTime.split(":")[1]);

    const initialDate = new Date(`${month}/${day}/${year}`);

    const startDateTime = new Date(
        initialDate.setHours(startTimeHour, startTimeMinute)
    );

    const endDateTime = new Date(
        initialDate.setHours(endTimeHour, endTimeMinute)
    );

    const event = {
        summary: `Afspraak met ${displayName}`,
        start: {
            //dateTime: dayjs(startDateTime).utc().tz("Europe/Amsterdam").format()
            dateTime: dayjs(startDateTime).add(-2, "hour").format(),
        },
        end: {
            //dateTime: dayjs(endDateTime).utc().tz("Europe/Amsterdam").format()
            dateTime: dayjs(endDateTime).add(-2, "hour").format(),
        },
        description: `Afspraak gemaakt door ${displayName} met telefoonnummer ${phoneNumber}`,
    };

    calendar.events.insert({
        'calendarId': GOOGLE_CALENDAR_ID,
        'requestBody': event
    });


    return getAppointmentString(startDateTime.toISOString(), endDateTime.toISOString(), "nl-NL");
}

/**
 * Sort the events into Slots and Appointments
 */
export function sortEvents(events: Schema$Event[]) {
    const timeSlots: any[] = [];
    const appointments: any[] = [];

    events.forEach((event: any) => {
        if (event.summary.toLowerCase() === "Beschikbaar".toLowerCase()) {
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
        (appointment) =>
            dayjs(appointment.end).format("DD/MM/YYYY") ===
            dayjs(timeSlot.start).format("DD/MM/YYYY")
    );
}

/**
 * Get the minutes between 2 date strings
 */
function getMinutesBetween(first: string, second: string) {
    return dayjs(second).diff(first, "minute");
}

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
                const minutes = getMinutesBetween(
                    timeSlot.start,
                    selectedAppointment.start
                );
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
                const minutes = getMinutesBetween(
                    selectedAppointment.end,
                    nextSelected.start
                );

                if (minutes > 0) {
                    availableTimeToday.push({
                        startTime: dayjs(selectedAppointment.end)
                            .add(timeBetweenAppointments, "minute")
                            .format(),
                        minutesBetween: minutes - timeBetweenAppointments,
                        endTime: dayjs(nextSelected.start).format(),
                    });
                }
            } else {
                const minutes = getMinutesBetween(
                    selectedAppointment.end,
                    timeSlot.end
                );

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
function getAvailableSlotsToday(availableTimeToday: any[], appointmentDuration: number, timeBetweenAppointments: number) {
    const availableSlotsToday: any[] = [];

    availableTimeToday.forEach((availableTime) => {
        let newAppointmentStartTime = dayjs(availableTime.startTime);
        let newAppointmentEndTime = dayjs(availableTime.startTime).add(
            appointmentDuration,
            "minute"
        );

        while (newAppointmentStartTime.isBefore(availableTime.endTime)) {
            if (newAppointmentEndTime.isBefore(availableTime.endTime)) {
                availableSlotsToday.push({
                    startTime: newAppointmentStartTime.format(),
                    endTime: newAppointmentEndTime.format(),
                });
            }

            newAppointmentStartTime = dayjs(newAppointmentStartTime).add(
                appointmentDuration + timeBetweenAppointments,
                "minute"
            );
            newAppointmentEndTime = dayjs(newAppointmentEndTime).add(
                appointmentDuration + timeBetweenAppointments,
                "minute"
            );
        }
    });

    return availableSlotsToday;
}


/**
 * Returns all available slots
 */
export function getAvailableSlotsTotal(timeSlots: any[], appointments: any[], timeBetweenAppointments: number, appointmentDuration: number) {
    const allSlots: any[] = [];

    timeSlots.forEach((timeSlot) => {
        const appointmentsToday = getAppointmentsForTimeSlot(appointments, timeSlot);

        const availableTimeToday = getAvailableTimeToday(
            appointmentsToday,
            timeSlot,
            timeBetweenAppointments
        );

        const availableSlotsToday = getAvailableSlotsToday(availableTimeToday, appointmentDuration, timeBetweenAppointments);

        availableSlotsToday.forEach((slot: any) => {
            if (dayjs(slot.startTime).isAfter(dayjs())) {
                allSlots.push(
                    {
                        fullString: getAppointmentString(slot.startTime, slot.endTime, "nl-NL"),
                        startDate: slot.startTime,
                        endDate: slot.endTime,
                    }
                );
            }
        });
    });
    return allSlots;
}

/**
 * Get the available weeks
 */
export function getAvailableWeeks(allSlots: any[]) {
    const weeks: any = {};

    allSlots.forEach((slot) => {
        const date = dayjs(slot.startDate);
        const weekNum = date.isoWeek();

        weeks[weekNum] = {
            title: `week ${weekNum}`,
            startDate: date.startOf("isoWeek").format(),
            description: `${getDateString(
                date.startOf("isoWeek").format()
            )} tot ${getDateString(date.endOf("isoWeek").format())}`,
            number: weekNum,
        };
    });

    return weeks;
}


/**
 * Get the days of the week that are available
 */
export function getDaysByWeek(allSlots: any[], weekNumber: number) {
    const days: any[] = [];

    allSlots.forEach((slot) => {
        const day = dateString(slot.startDate, "nl-NL", 'Europe/Amsterdam',{ dateStyle: "full" });
        const weekNum = dayjs(slot.startDate).isoWeek();

        if (weekNum === weekNumber) {
            if (days.find((d) => d.parsedDate === day)) {
            } else {
                days.push({
                    parsedDate: day,
                    actualDate: dayjs(slot.startDate).format("DD/MM/YYYY"),
                });
            }
        }
    });

    return days;
}

/**
 * Get the appointments by day
 */
export function getAppointmentsByDay(allSlots: any[], date: string) {
    const days: any[] = [];

    allSlots.forEach((slot) => {
        const day = dayjs(slot.startDate).format("DD/MM/YYYY");

        if (day === date) {
            if (days.length < 9) {
                days.push(slot);
            }
        }
    });

    return days;
}
