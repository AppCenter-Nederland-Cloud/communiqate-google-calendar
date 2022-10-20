import { calendar_v3 } from 'googleapis';
import Schema$Event = calendar_v3.Schema$Event;
export interface CalendarConfigProps {
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_CALENDAR_ID: string;
    SCOPES: string;
}
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
 * Check if that day is available
 * @param day
 * @param timeBetweenAppointments
 * @param appointmentDuration
 */
export declare function checkDayAvailable(day: CalendarDay, timeBetweenAppointments: number, appointmentDuration: number): boolean;
/**
 * Check if the week is available
 * @param weekData
 * @param timeBetweenAppointments
 * @param appointmentDuration
 */
export declare function checkWeekAvailable(weekData: CalendarDay[], timeBetweenAppointments: number, appointmentDuration: number): boolean;
/**
 * Get all the events from the Google calendar
 */
export declare function getCalendarEvents(calendarConfig: CalendarConfigProps, timeMin: string, timeMax: string): Promise<number>;
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
