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
export declare function getAppointmentString(start: string, end: string, locale?: string, timeZone?: string): string;
/**
 * Gets a time range from 2 date strings
 */
export declare function getTimeRange(startDate: string, endDate: string): string;
/**
 * Gets a week string as "24 Oktober 2022 - 30 Oktober 2022"
 * @param startDate
 * @param endDate
 * @param locale
 * @param timeZone
 */
export declare function getWeekString(startDate: string, endDate: string, locale?: string, timeZone?: string): string;
/**
 * Get the minutes between 2 date strings
 */
export declare function getMinutesBetween(first: string, second: string): number;
export declare function appointmentStringToDate(appointmentString: string): Date;
/**
 * Check if the given appointment is before the current date, if so return true else return fase
 */
export declare function appointmentHasPassed(appointmentString: string): {
    currentDate: Date;
    appointmentDate: Date;
    hasPassed: boolean;
};
