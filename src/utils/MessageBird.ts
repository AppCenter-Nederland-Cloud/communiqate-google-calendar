import { dateString } from './Functions';

const axios = require('axios');

export async function sendDaysMessage(conversationId: string, apiKey: string, days: any[], weekNumber: number) {
  const MessageBirdMessages = axios.create({
    baseURL: `https://conversations.messagebird.com/v1/conversations/${conversationId}`,
    headers: {
      Authorization: `AccessKey ${apiKey}`,
    },
  });

  const rows: any[] = [];

  days.forEach((day) => {
    rows.push({
      id: day.actualDate,
      title: day.actualDate,
      description: day.parsedDate,
    });
  });

  rows.push({
    id: 'anders',
    title: 'Andere week kiezen',
    description: 'Kies voor deze optie als u voor een andere week een afspraak wilt maken.',
  });

  await MessageBirdMessages.post('/messages', {
    type: 'interactive',
    content: {
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Afspraak planner',
        },
        body: {
          text: 'Dit zijn de dagen die beschikbaar zijn voor deze week, wil je toch een andere week kiezen? Kies dan voor Andere week kiezen.',
        },
        action: {
          sections: [
            {
              title: `Beschikbaarheid week ${weekNumber}`,
              rows: rows,
            },
          ],
          button: 'Datum kiezen',
        },
      },
    },
  });

  return true;
}

export async function sendAppointmentMessage(
  conversationId: string,
  apiKey: string,
  appointments: any[],
  date: string,
) {
  const rows = [];

  const MessageBirdMessages = axios.create({
    baseURL: `https://conversations.messagebird.com/v1/conversations/${conversationId}`,
    headers: {
      Authorization: `AccessKey ${apiKey}`,
    },
  });

  appointments.forEach((app) => {
    const title = `${dateString(app.startDate, 'nl-NL', 'Europe/Amsterdam', {
      timeStyle: 'short',
    })} - ${dateString(app.endDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' })}`;

    rows.push({
      id: app.startDate,
      title: title,
      description: app.fullString,
    });
  });

  rows.push({
    id: 'anders',
    title: 'Andere dag kiezen',
    description: 'Kies voor deze optie als u voor een andere dag een afspraak wilt maken.',
  });

  return await MessageBirdMessages.post('/messages', {
    type: 'interactive',
    content: {
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Afspraak planner',
        },
        body: {
          text: 'Dit zijn de tijden die beschikbaar zijn voor deze dag, wil je toch een andere dag kiezen? Kies dan voor andere dag kiezen.',
        },
        action: {
          sections: [
            {
              title: `${date}`,
              rows: rows,
            },
          ],
          button: 'Tijdstip kiezen',
        },
      },
    },
  });
}
