import { APIEndpoint, GaxiosPromise } from 'googleapis-common';
import { calendar_v3 } from 'googleapis';
/**
 * Google calendar client wrapper
 */
export declare class GoogleCalendar {
    /**
     * The Google api client
     */
    client: APIEndpoint;
    /**
     * The calendar id
     */
    calendarId?: string;
    /**
     * @param googleClientEmail
     * @param googlePrivateKey
     * @param calendarId
     */
    constructor(googleClientEmail: string, googlePrivateKey: string, calendarId?: string);
    /**
     * Get the calendar events
     * @param timeZone
     * @param timeMin
     * @param timeMax
     * @param options
     */
    getEvents(timeMin: string, timeMax: string, timeZone?: string, options?: calendar_v3.Params$Resource$Events$List): Promise<GaxiosPromise<calendar_v3.Schema$Events>>;
    /**
     * Create a new calendar event
     * @param event
     * @param options
     */
    createEvent(event: calendar_v3.Schema$Event, options?: calendar_v3.Params$Resource$Events$Insert): Promise<GaxiosPromise<calendar_v3.Schema$Event>>;
}
