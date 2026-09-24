import apiClient from './client';
import { Notification } from '../types/notification';

export const getNotificationsApi = async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
};

export const markNotificationReadApi = async (id: number): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsReadApi = async (): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/notifications/read-all');
    return response.data;
};
