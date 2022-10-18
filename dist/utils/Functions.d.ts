/**
 * Gets the date string as specified in the options
 */
export declare function dateString(date: string, locale?: string, timeZone?: string, options?: any): string;
/**
 * Gets the date string as example: "10 oktober 2022
 */
export declare function getDateString(date: string, locale?: string, timeZone?: string): string;
/**
 * gets the appointment string as "woensdag 18 januari 2023 tussen 16:00 en 16:30"
 */
export declare function getAppointmentString(start: string, end: string, locale?: string): string;
/**
 * Gets a time range from 2 date strings
 */
export declare function getTimeRange(startDate: string, endDate: string): string;
