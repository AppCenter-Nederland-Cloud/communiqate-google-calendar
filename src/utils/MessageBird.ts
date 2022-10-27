import { dateString, getAppointmentString } from './Functions';
import { Appointment, CalendarDay } from './Calendar';

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
      rows.push({
        id: day.start,
        title: dateString(day.start, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'short' }), //parse,
        description: dateString(day.start, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'full' }),
      });
    }
  });

  rows.push({
    id: 'anders',
    title: 'Andere week kiezen',
    description: 'Kies deze optie wanneer je toch een moment wil kiezen in een andere week.',
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

  const rows = [];

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

    if (rows.length < 9) {
      rows.push({
        id: appointment.start,
        title: title,
        description: getAppointmentString(appointment.start, appointment.end),
      });
    }
  });

  rows.push({
    id: 'anders',
    title: 'Andere dag kiezen',
    description: 'Kies deze optie wanneer je toch een moment wil kiezen op een andere dag.',
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
