import * as dayjs from 'dayjs';

/**
 * Gets the date string as specified in the options
 */
export function dateString(
  date: string | Date,
  locale = 'nl-NL',
  timeZone = 'Europe/Amsterdam',
  options: any = undefined,
) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: timeZone,
  }).format(new Date(date));
}

/**
 * Gets the date string as example: "10 oktober 2022
 */
export function getDateString(date: string, locale = 'nl-NL', timeZone = 'Europe/Amsterdam') {
  return dateString(date, locale, timeZone, { dateStyle: 'long' });
}

/**
 * gets the appointment string as "woensdag 18 januari 2023 tussen 16:00 en 16:30"
 */
export function getAppointmentString(start: string, end: string, locale = 'nl-NL', timeZone = 'Europe/Amsterdam') {
  const date = dateString(start, locale, timeZone, {
    dateStyle: 'full',
  });
  const startTime = dateString(start, locale, timeZone, {
    timeStyle: 'short',
  });
  // const endTime = dateString(end, locale, timeZone, {
  //   timeStyle: 'short',
  // });

  return `${date} om ${startTime}`;
}

/**
 * Gets a time range from 2 date strings
 */
export function getTimeRange(startDate: string, endDate: string) {
  const startTime = dateString(startDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' });
  const endTime = dateString(endDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' });

  return `${startTime} - ${endTime}`;
}

/**
 * Gets a week string as "24 Oktober 2022 - 30 Oktober 2022"
 * @param startDate
 * @param endDate
 * @param locale
 * @param timeZone
 */
export function getWeekString(startDate: string, endDate: string, locale = 'nl-NL', timeZone = 'Europe/amsterdam') {
  return `${getDateString(startDate, locale, timeZone)} - ${getDateString(endDate, locale, timeZone)}`;
}

/**
 * Get the minutes between 2 date strings
 */
export function getMinutesBetween(first: string, second: string) {
  return dayjs(second).diff(first, 'minute');
}

export function appointmentStringToDate(appointmentString: string) {
  return new Date(appointmentString.replace('om ', ''));
}

/**
 * Check if the given appointment is before the current date, if so return true else return fase
 */
export function appointmentHasPassed(appointmentString: string) {
  const validAppointmentString = appointmentString.replace('om ', '');

  // UTC -> Europe/Amsterdam
  const currentDate = dateString(new Date(), 'nl-NL', 'Europe/Amsterdam', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  // Europe/Amsterdam
  const appointmentDate = new Date(validAppointmentString);

  return {
    currentDate: currentDate,
    appointmentDate: appointmentDate,
    hasPassed: new Date(currentDate).getTime() > new Date(validAppointmentString).getTime(),
  };
}
