import { Appointment, CalendarDay } from './Calendar';
interface MessageBirdConfig {
    conversationId: string;
    apiKey: string;
}
export declare function sendErrorMessage(config: MessageBirdConfig, errorMessage: string): Promise<void>;
export declare function sendDaysMessage(config: MessageBirdConfig, days: CalendarDay[], weekNumber: number): Promise<boolean>;
export declare function sendAppointmentMessage(config: MessageBirdConfig, appointments: Appointment[], dateResponse: string): Promise<any>;
export {};
