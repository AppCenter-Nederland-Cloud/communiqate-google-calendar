/**
 * Gets the date string as specified in the options
 */
export function dateString(date: string, locale = 'nl-NL', timeZone = 'Europe/Amsterdam', options: any = undefined) {
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
export function getAppointmentString(start: string, end: string, locale = 'nl-NL') {
  const date = dateString(start, locale, 'Europe/Amsterdam', {
    dateStyle: 'full',
  });
  const startTime = dateString(start, locale, 'Europe/Amsterdam', {
    timeStyle: 'short',
  });
  const endTime = dateString(end, locale, 'Europe/Amsterdam', {
    timeStyle: 'short',
  });

  return `${date} tussen ${startTime} en ${endTime}`;
}

/**
 * Gets a time range from 2 date strings
 */
export function getTimeRange(startDate: string, endDate: string) {
  const startTime = dateString(startDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' });
  const endTime = dateString(endDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' });

  return `${startTime} - ${endTime}`;
}
