import { CalendarDay } from './Calendar';
interface MessageBirdConfig {
    conversationId: string;
    apiKey: string;
}
export declare function sendErrorMessage(config: MessageBirdConfig, errorMessage: string): Promise<void>;
export declare function sendDaysMessage(config: MessageBirdConfig, days: CalendarDay[], weekNumber: number): Promise<boolean>;
export declare function sendAppointmentMessage(conversationId: string, apiKey: string, appointments: any[], date: string): Promise<any>;
export {};
