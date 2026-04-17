import { create } from 'zustand';
import type { AppNotification } from '../types/notification';

export interface NotificationState {
  /** Danh sách notification (mới nhất ở đầu) */
  notifications: AppNotification[];
  /** Số notification chưa đọc */
  unreadCount: number;
  /** Trạng thái kết nối Centrifugo */
  isConnected: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  /** Thêm notification mới vào đầu list + tăng unreadCount */
  addNotification: (notification: AppNotification) => void;
  /** Thay toàn bộ notification list (từ API fetch) */
  setNotifications: (notifications: AppNotification[]) => void;
  /** Set unread count từ API */
  setUnreadCount: (count: number) => void;
  /** Set trạng thái kết nối WebSocket */
  setConnected: (connected: boolean) => void;
  /** Mark một notification là đã đọc (local state) */
  markOneRead: (notificationId: string) => void;
  /** Mark tất cả là đã đọc (local state) */
  markAllRead: () => void;
  /** Reset toàn bộ state (khi logout) */
  reset: () => void;
}

const initialState = {
  notifications: [] as AppNotification[],
  unreadCount: 0,
  isConnected: false,
};

export const useNotificationStore = create<NotificationState>((set) => ({
  ...initialState,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setNotifications: (notifications) => set({ notifications }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  setConnected: (connected) => set({ isConnected: connected }),

  markOneRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.notificationId === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  reset: () => set({ ...initialState }),
}));
