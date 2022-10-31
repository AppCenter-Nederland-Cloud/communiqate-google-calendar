import { google } from 'googleapis';
import { APIEndpoint, GaxiosPromise } from 'googleapis-common';
import { calendar_v3 } from 'googleapis';

/**
 * Google calendar client wrapper
 */
export class GoogleCalendar {
  /**
   * The Google api client
   */
  public client: APIEndpoint;

  /**
   * The calendar id
   */
  public calendarId?: string;

  /**
   * @param googleClientEmail
   * @param googlePrivateKey
   * @param calendarId
   */
  constructor(googleClientEmail: string, googlePrivateKey: string, calendarId?: string) {
    this.calendarId = calendarId;

    const jwtClient = new google.auth.JWT(
      googleClientEmail,
      undefined,
      googlePrivateKey,
      'https://www.googleapis.com/auth/calendar',
    );

    this.client = google.calendar({
      version: 'v3',
      auth: jwtClient,
    });
  }

  /**
   * Get the calendar events
   * @param timeZone
   * @param timeMin
   * @param timeMax
   * @param options
   */
  public async getEvents(
    timeMin: string,
    timeMax: string,
    timeZone = 'UTC',
    options?: calendar_v3.Params$Resource$Events$List,
  ): Promise<GaxiosPromise<calendar_v3.Schema$Events>> {
    return await this.client.events.list({
      calendarId: this.calendarId,
      maxResults: 250,
      timeZone: timeZone,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      ...options,
    });
  }

  /**
   * Create a new calendar event
   * @param event
   * @param options
   */
  public async createEvent(
    event: calendar_v3.Schema$Event,
    options?: calendar_v3.Params$Resource$Events$Insert,
  ): Promise<GaxiosPromise<calendar_v3.Schema$Event>> {
    return await this.client.events.insert({
      calendarId: this.calendarId,
      requestBody: event,
      ...options,
    });
  }
}
