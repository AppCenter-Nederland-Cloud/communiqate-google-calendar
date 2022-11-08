import { ApiClient } from '@acn-cloud/communiqate-api-js';

export interface CommuniqateConfigProps {
  COMMUNIQATE_API_KEY: string;
}

interface ReminderConfigProps {
  phoneNumber: string;
  appointmentDate: string;
  reminderTime: number;

  endpoint?: string;
  templateMessageId: string;

  variables?: {
    header?: string;
    body?: string[];
    buttons?: string[];
  };
}

interface MoveReminderProps {
  phoneNumber: string;
  appointmentDate: string;
  reminderTime: number;
  messageId: string;

  endpoint?: string;
}

/**
 * creates a new reminder message
 * @param communiqateConfig
 * @param reminderConfig
 */
export async function planReminder(communiqateConfig: CommuniqateConfigProps, reminderConfig: ReminderConfigProps) {
  const { phoneNumber, appointmentDate, reminderTime, endpoint, templateMessageId, variables } = reminderConfig;

  const { COMMUNIQATE_API_KEY } = communiqateConfig;

  const appointment = new Date(appointmentDate);

  appointment.setMinutes(appointment.getMinutes() - reminderTime);
  const reminderDateTime = appointment.toISOString();

  const api = new ApiClient(COMMUNIQATE_API_KEY, endpoint);

  const message = await api.conversations().sendMessage(phoneNumber, {
    scheduled_at: reminderDateTime,
    template_message_id: templateMessageId,
    variables: variables,
  });

  return message.data;
}

/**
 * moves existing reminder to a new date
 * @param communiqateConfig
 * @param reminderProps
 */
export async function moveReminder(communiqateConfig: CommuniqateConfigProps, reminderProps: MoveReminderProps) {
  const { phoneNumber, appointmentDate, reminderTime, endpoint, messageId } = reminderProps;
  const { COMMUNIQATE_API_KEY } = communiqateConfig;

  const appointment = new Date(appointmentDate);

  appointment.setMinutes(appointment.getMinutes() - reminderTime);
  const reminderDateTime = appointment.toISOString();

  const api = new ApiClient(COMMUNIQATE_API_KEY, endpoint);

  const message = await api.conversations().updateMessage(phoneNumber, {
    message_id: messageId,
    scheduled_at: reminderDateTime,
  });

  return message.data;
}

/**
 * deletes the given reminder
 * @param communiqateConfig
 * @param messageId
 * @param phoneNumber
 * @param endpoint
 */
export async function cancelReminder(
  communiqateConfig: CommuniqateConfigProps,
  messageId: string,
  phoneNumber: string,
  endpoint: string,
) {
  const { COMMUNIQATE_API_KEY } = communiqateConfig;

  const api = new ApiClient(COMMUNIQATE_API_KEY, endpoint);

  const message = await api.conversations().deleteMessage(phoneNumber, {
    message_id: messageId,
  });

  return message.data;
}
