import type {
    NotificationsQueryParams,
    NotificationsResponse,
    RealtimeTokenResponse,
    UnreadNotificationCountResponse,
} from '../types/notification';
import api from './api';

export async function fetchRealtimeToken(): Promise<RealtimeTokenResponse> {
  const res = await api.get<RealtimeTokenResponse>('/realtime/token');
  return res.data;
}

export async function fetchNotifications(
  params: NotificationsQueryParams = {},
): Promise<NotificationsResponse> {
  const res = await api.get<NotificationsResponse>('/notifications', {
    params,
  });
  return res.data;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await api.get<UnreadNotificationCountResponse>(
    '/notifications/unread-count',
  );
  return res.data.unreadCount ?? 0;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.patch('/notifications/read-all');
  } catch {
    await api.post('/notifications/read-all');
  }
}
