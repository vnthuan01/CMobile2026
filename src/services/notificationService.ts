import type {
    NotificationsQueryParams,
    NotificationsResponse,
    RealtimeTokenResponse,
    UnreadNotificationCountResponse,
} from '../types/notification';
import api from './api';

const isLikelyPrivateRealtimeEndpoint = (endpoint?: string | null) => {
  const value = String(endpoint ?? '')
    .trim()
    .toLowerCase();

  if (!value) {
    return true;
  }

  return (
    value.includes('centrifugo:') ||
    value.includes('localhost') ||
    value.includes('127.0.0.1') ||
    value.includes('10.0.2.2') ||
    value.includes('192.168.') ||
    value.includes('172.16.') ||
    value.includes('172.17.') ||
    value.includes('172.18.') ||
    value.includes('172.19.') ||
    value.includes('172.20.') ||
    value.includes('172.21.') ||
    value.includes('172.22.') ||
    value.includes('172.23.') ||
    value.includes('172.24.') ||
    value.includes('172.25.') ||
    value.includes('172.26.') ||
    value.includes('172.27.') ||
    value.includes('172.28.') ||
    value.includes('172.29.') ||
    value.includes('172.30.') ||
    value.includes('172.31.')
  );
};

const normalizeWsUrl = (value?: string | null): string => {
  return String(value ?? '').trim().replace(/\/+$/, '');
};

function resolveRealtimeEndpoint(endpoint?: string | null): string {
  const envRealtimeUrl = normalizeWsUrl(process.env.EXPO_PUBLIC_REALTIME_WS_URL);
  const sessionEndpoint = normalizeWsUrl(endpoint);

  if (!sessionEndpoint) {
    return envRealtimeUrl;
  }

  if (!isLikelyPrivateRealtimeEndpoint(sessionEndpoint)) {
    return sessionEndpoint;
  }

  return envRealtimeUrl || sessionEndpoint;
}

export async function fetchRealtimeToken(): Promise<RealtimeTokenResponse> {
  const res = await api.get<RealtimeTokenResponse>('/realtime/token');

  return {
    ...res.data,
    endpoint: resolveRealtimeEndpoint(res.data?.endpoint),
  };
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
