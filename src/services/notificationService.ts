import type {
  AppNotification,
  NotificationListResponse,
  RealtimeTokenResponse,
  UnreadCountResponse,
} from '../types/notification';
import api from './api';

// ── Realtime Token ────────────────────────────────────────────────────────────

/**
 * Gọi GET /api/realtime/token để lấy Centrifugo token + endpoint + channel.
 * KHÔNG dùng app JWT để connect WebSocket trực tiếp.
 */
export async function fetchRealtimeToken(): Promise<RealtimeTokenResponse> {
  const res = await api.get<RealtimeTokenResponse>('/realtime/token');
  return res.data;
}

// ── Notification List ─────────────────────────────────────────────────────────

export async function fetchNotifications(params?: {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
}): Promise<NotificationListResponse> {
  const res = await api.get<NotificationListResponse>('/notifications', {
    params,
  });
  return res.data;
}

// ── Unread Count ──────────────────────────────────────────────────────────────

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get<UnreadCountResponse>('/notifications/unread-count');
  // Backend có thể trả về { count: N } hoặc trực tiếp number
  const raw = res.data as unknown;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'object' && raw !== null && 'count' in raw) {
    return (raw as { count: number }).count;
  }
  return 0;
}

// ── Mark Read ─────────────────────────────────────────────────────────────────

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch {
    // Có thể dùng PUT nếu PATCH không hoạt động
    await api.put(`/notifications/${notificationId}/read`);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}

export type {
  AppNotification,
  NotificationListResponse,
  RealtimeTokenResponse
};

