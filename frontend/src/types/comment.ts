import { User } from './auth';

export interface Comment {
    id: number;
    ticket_id: number;
    author_id: number;
    content: string;
    is_internal: boolean;
    created_at: string;
    author: User;
}

export interface CommentCreate {
    content: string;
    is_internal?: boolean;
}

export interface TicketHistory {
    id: number;
    ticket_id: number;
    actor_id: number;
    action: string;
    old_value: string | null;
    new_value: string | null;
    timestamp: string;
    actor: User;
}
