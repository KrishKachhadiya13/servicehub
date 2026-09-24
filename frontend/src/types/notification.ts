export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    ticket_id: number | null;
    is_read: boolean;
    created_at: string;
}
