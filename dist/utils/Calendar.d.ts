import { calendar_v3 } from 'googleapis';
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;
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
export declare function checkWeekAvailable(weekData: CalendarDay[]): boolean;
/**
 * Get the 6 next available weeks
 */
export declare function getAvailableWeeks(config: CalendarConfigProps, appointmentDuration: number, timeBetweenAppointments: number, timeInAdvance: number): Promise<CalendarWeek[]>;
/**
 * Get the events from the Google Calendar that are in the given weekNumber
 * @param calendarConfig
 * @param weekNum
 */
export declare function getWeekEvents(calendarConfig: CalendarConfigProps, weekNum: number): Promise<any[]>;
/**
 * Create calendar appointment
 */
export declare function makeCalendarEvent(calendarConfig: CalendarConfigProps, startDate: string, endDate: string, title: string, description?: string, options?: {}): Promise<{
    appointmentString: string;
    eventId: string | undefined;
}>;
/**
 * sort the event into a day object.
 */
export declare function sortEventByDay(events: GoogleCalendarEvent[], appointmentDuration: number, timeBetweenAppointments: number, timeInAdvance: number): CalendarDay[];
/**
 * Returns the slots for a given timeSlot(day)
 */
export declare function getSlotsForDay(appointments: GoogleCalendarEvent[], timeSlot: GoogleCalendarEvent, appointmentDuration: number, timeBetweenAppointments: number, timeInAdvance: number): Appointment[];
/**
 * Finds the corresponding date and returns it
 */
export declare function findDate(weeks: CalendarWeek[], date: string, timeRange: string): {
    start: any;
    end: any;
};
