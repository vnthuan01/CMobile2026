import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';
import { useNotificationStore } from '../store/notificationStore';
import type { AppNotification } from '../types/notification';

// ── Query Keys ────────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: { pageNumber?: number; pageSize?: number; isRead?: boolean }) =>
    [...notificationKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

// ── Notification List ─────────────────────────────────────────────────────────

export function useNotificationList(params?: {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryParams } = params ?? {};
  const { setNotifications } = useNotificationStore();

  return useQuery({
    queryKey: notificationKeys.list(queryParams),
    queryFn: () => fetchNotifications(queryParams),
    enabled,
    select: (data: { data?: AppNotification[] }) => data.data ?? ([] as AppNotification[]),
  } as any);
}

// ── Unread Count ──────────────────────────────────────────────────────────────

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    enabled,
    refetchInterval: 60_000, // Refresh mỗi 1 phút như fallback
  } as any);
}

// ── Mark Read ──────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { markOneRead } = useNotificationStore();

  return async (notificationId: string) => {
    try {
      markOneRead(notificationId); // Optimistic local update
      await markNotificationRead(notificationId);
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    } catch {
      // Không roll back - unread count API sẽ sync lại sau
    }
  };
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const { markAllRead } = useNotificationStore();

  return async () => {
    try {
      markAllRead(); // Optimistic local update
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    } catch {
      // Ignore
    }
  };
}
