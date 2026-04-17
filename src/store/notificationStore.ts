import { create } from 'zustand';
import type {
    AppNotification,
    RealtimeTokenResponse,
} from '../types/notification';

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
  realtimeSession: RealtimeTokenResponse | null;
  setConnected: (connected: boolean) => void;
  setUnreadCount: (count: number) => void;
  setRealtimeSession: (session: RealtimeTokenResponse | null) => void;
  setNotifications: (items: AppNotification[]) => void;
  upsertNotification: (item: AppNotification) => void;
  markAsReadLocal: (notificationId: string) => void;
  markAllAsReadLocal: () => void;
  reset: () => void;
}

const initialState = {
  items: [] as AppNotification[],
  unreadCount: 0,
  isConnected: false,
  realtimeSession: null as RealtimeTokenResponse | null,
};

export const useNotificationStore = create<NotificationState>((set) => ({
  ...initialState,

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: Math.max(0, count) });
  },

  setRealtimeSession: (session: RealtimeTokenResponse | null) => {
    set({ realtimeSession: session });
  },

  setNotifications: (items: AppNotification[]) => {
    const nextItems = [...items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    set({
      items: nextItems,
      unreadCount: nextItems.filter((item) => !item.isRead).length,
    });
  },

  upsertNotification: (item: AppNotification) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (current) => current.notificationId === item.notificationId,
      );

      if (existingIndex >= 0) {
        const merged = [...state.items];
        const prev = merged[existingIndex];
        merged[existingIndex] = { ...prev, ...item };
        merged.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return {
          items: merged,
          unreadCount: merged.filter((entry) => !entry.isRead).length,
        };
      }

      const merged = [item, ...state.items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        items: merged,
        unreadCount: merged.filter((entry) => !entry.isRead).length,
      };
    });
  },

  markAsReadLocal: (notificationId: string) => {
    set((state) => {
      const updated = state.items.map((item) => {
        if (item.notificationId !== notificationId || item.isRead) {
          return item;
        }
        return {
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        };
      });

      return {
        items: updated,
        unreadCount: updated.filter((item) => !item.isRead).length,
      };
    });
  },

  markAllAsReadLocal: () => {
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  reset: () => {
    set({ ...initialState });
  },
}));
