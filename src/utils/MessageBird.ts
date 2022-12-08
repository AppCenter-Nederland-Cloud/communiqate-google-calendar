import { dateString, getAppointmentString } from './Functions';
import { Appointment, CalendarDay, getSlotsFromWeek } from './Calendar';

const axios = require('axios');

const url = 'https://conversations.messagebird.com/v1/conversations';

interface MessageBirdConfig {
  conversationId: string;
  apiKey: string;
}

export async function sendErrorMessage(config: MessageBirdConfig, errorMessage: string) {
  const { conversationId, apiKey } = config;

  const MessageBirdMessages = axios.create({
    baseURL: `${url}/${conversationId}`,
    headers: {
      Authorization: `AccessKey ${apiKey}`,
    },
  });

  MessageBirdMessages.post('/messages', {
    type: 'interactive',
    content: {
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: 'Er is een fout opgetreden',
        },
        body: {
          text: errorMessage,
        },
        action: {
          buttons: [
            {
              id: 'no-unique-id',
              type: 'reply',
              title: 'Opnieuw proberen',
            },
          ],
        },
      },
    },
  });
}

export async function sendDaysMessage(config: MessageBirdConfig, days: CalendarDay[], weekNumber: number) {
  const { conversationId, apiKey } = config;

  const MessageBirdMessages = axios.create({
    baseURL: `${url}/${conversationId}`,
    headers: {
      Authorization: `AccessKey ${apiKey}`,
    },
  });

  const rows: any[] = [];

  days.forEach((day) => {
    if (day.slots.length > 0) {
      if (rows.length < 10) {
        rows.push({
          id: day.start,
          title: dateString(day.start, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'short' }), //parse,
          description: dateString(day.start, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'full' }),
        });
      }
    }
  });

  await MessageBirdMessages.post('/messages', {
    type: 'interactive',
    content: {
      interactive: {
        type: 'list',
        body: {
          text: 'Hieronder kun je kiezen uit de beschikbare dagen voor de door jouw gekozen week.',
        },
        action: {
          sections: [
            {
              title: `Beschikbaarheid week ${weekNumber}`,
              rows: rows,
            },
          ],
          button: 'Dag kiezen',
        },
      },
    },
  });

  return true;
}

export async function sendAppointmentMessage(
  config: MessageBirdConfig,
  appointments: Appointment[],
  dateResponse: string,
) {
  const { conversationId, apiKey } = config;

  const rows: any[] = [];

  const MessageBirdMessages = axios.create({
    baseURL: `${url}/${conversationId}`,
    headers: {
      Authorization: `AccessKey ${apiKey}`,
    },
  });

  appointments.forEach((appointment) => {
    const title = `${dateString(appointment.start, 'nl-NL', 'Europe/Amsterdam', {
      timeStyle: 'short',
    })} - ${dateString(appointment.end, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' })}`;

    if (rows.length < 10) {
      rows.push({
        id: appointment.start,
        title: title,
        description: getAppointmentString(appointment.start, appointment.end),
      });
    }
  });

  return await MessageBirdMessages.post('/messages', {
    type: 'interactive',
    content: {
      interactive: {
        type: 'list',
        body: {
          text: 'Hieronder kun je kiezen uit de beschikbare tijdstippen voor de door jouw gekozen dag.',
        },
        action: {
          sections: [
            {
              title: `${dateResponse}`,
              rows: rows,
            },
          ],
          button: 'Tijdstip kiezen',
        },
      },
    },
  });
}

export async function sendSuggestionsMessage(config: MessageBirdConfig, weeks: any[], sendMessage = true) {
  const { conversationId, apiKey } = config;

  const MessageBirdMessages = axios.create({
    baseURL: `${url}/${conversationId}`,
    headers: {
      Authorization: `AccessKey ${apiKey}`,
    },
  });

  const slots = getSlotsFromWeek(weeks);

  const suggestionRows: any[] = [];
  const weekRows: any[] = [];

  if (slots.length === 0) {
    //send alternative message (nothing available)
    return false;
  }

  if (slots.length > 9) {
    // there are more than 10 slots. So, send 3 suggestions and (max 7) weeks.

    //push the first 3 suggestions
    for (let i = 0; i < 3; i++) {
      suggestionRows.push({
        id: `Voorstel ${i}`,
        title: `Voorstel ${i + 1}`,
        description: slots[i].parsedString,
      });
    }

    //only 7 weeks may be pushed, if less than 7 are available, push all the weeks.
    if (weeks.length < 7) {
      //push all the weeks
      weeks.forEach((week) => {
        weekRows.push({
          id: `week ${week.week}`,
          title: `week ${week.week}`,
          description: week.weekString,
        });
      });
    } else {
      //only push the first 7

      for (let i = 0; i < 7; i++) {
        const week = weeks[i];
        weekRows.push({
          id: `week ${week.week}`,
          title: `week ${week.week}`,
          description: week.weekString,
        });
      }
    }
  } else {
    //only fill up the suggestions with all slots.
    for (let i = 0; i < slots.length; i++) {
      suggestionRows.push({
        id: `Voorstel ${i}`,
        title: `Voorstel ${i + 1}`,
        description: slots[i].parsedString,
      });
    }
  }

  if (!sendMessage) {
    return slots;
  }

  await MessageBirdMessages.post('/messages', {
    type: 'interactive',
    content: {
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Laten we een afspraak plannen!',
        },
        body: {
          text: 'We kunnen een afspraak met je plannen. Druk op "Moment kiezen" om een geschikt moment voor je afspraak te kiezen.',
        },
        action: {
          sections:
            weekRows.length > 0
              ? [
                  {
                    title: `Voorstellen`,
                    rows: suggestionRows,
                  },
                  {
                    title: `Ander moment`,
                    rows: weekRows,
                  },
                ]
              : [
                  {
                    title: `Voorstellen`,
                    rows: suggestionRows,
                  },
                ],
          button: 'Moment kiezen',
        },
      },
    },
  });

  return slots;
}
