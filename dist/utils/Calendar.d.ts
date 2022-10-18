import { calendar_v3 } from 'googleapis';
import Schema$Event = calendar_v3.Schema$Event;
export interface CalendarConfigProps {
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_CALENDAR_ID: string;
    SCOPES: string;
}
/**
 * Get all the events from the Google calendar
 */
export declare function getCalendarEvents(calendarConfig: CalendarConfigProps, timeMin: string, timeMax: string): Promise<calendar_v3.Schema$Event[] | undefined>;
/**
 * Create calendar appointment
 */
export declare function makeCalendarEvent(calendarConfig: CalendarConfigProps, date: string, timeRange: string, displayName: string, phoneNumber: string): Promise<string>;
/**
 * Sort the events into Slots and Appointments
 */
export declare function sortEvents(events: Schema$Event[]): {
    timeSlots: any[];
    appointments: any[];
};
/**
 * Returns all available slots
 */
export declare function getAvailableSlotsTotal(timeSlots: any[], appointments: any[], timeBetweenAppointments: number, appointmentDuration: number): any[];
/**
 * Get the available weeks
 */
export declare function getAvailableWeeks(allSlots: any[]): any;
/**
 * Get the days of the week that are available
 */
export declare function getDaysByWeek(allSlots: any[], weekNumber: number): any[];
/**
 * Get the appointments by day
 */
export declare function getAppointmentsByDay(allSlots: any[], date: string): any[];
