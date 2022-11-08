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
export declare function planReminder(communiqateConfig: CommuniqateConfigProps, reminderConfig: ReminderConfigProps): Promise<import("@acn-cloud/communiqate-api-js").Message>;
/**
 * moves existing reminder to a new date
 * @param communiqateConfig
 * @param reminderProps
 */
export declare function moveReminder(communiqateConfig: CommuniqateConfigProps, reminderProps: MoveReminderProps): Promise<import("@acn-cloud/communiqate-api-js").Message>;
/**
 * deletes the given reminder
 * @param communiqateConfig
 * @param messageId
 * @param phoneNumber
 * @param endpoint
 */
export declare function cancelReminder(communiqateConfig: CommuniqateConfigProps, messageId: string, phoneNumber: string, endpoint: string): Promise<any>;
export {};
