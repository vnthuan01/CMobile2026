import { Centrifuge, type Subscription } from 'centrifuge';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  fetchRealtimeToken,
  fetchUnreadCount,
} from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { AppNotification } from '../types/notification';
import { showInfoToast } from '../utils/toast';

/**
 * Hook quản lý toàn bộ lifecycle kết nối Centrifugo realtime.
 *
 * Flow:
 * 1. Khi user login (isAuthenticated = true) → fetchRealtimeToken()
 * 2. Tạo Centrifuge instance với endpoint + token từ backend
 * 3. Subscribe channel notifications:user:{userId}
 * 4. Khi nhận publication → addNotification() + hiện toast
 * 5. Khi app về foreground → kiểm tra và reconnect nếu cần
 * 6. Khi logout → disconnect + cleanup
 *
 * Mount hook này tại root layout để connection sống cùng vòng đời app.
 */
export function useCentrifugoConnection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const centrifugeRef = useRef<Centrifuge | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const tokenExpiresAtRef = useRef<string | null>(null);

  const { addNotification, setUnreadCount, setConnected, reset } =
    useNotificationStore();

  // ── Connect / Disconnect ────────────────────────────────────────────────────

  async function connect() {
    if (centrifugeRef.current) {
      // Đã có instance, không tạo lại
      return;
    }

    try {
      const { token, endpoint, channel, expiresAt } =
        await fetchRealtimeToken();

      tokenExpiresAtRef.current = expiresAt;

      if (__DEV__) {
        console.info('[Centrifugo] Connecting to', endpoint);
        console.info('[Centrifugo] Channel:', channel);
      }

      const centrifuge = new Centrifuge(endpoint, {
        token,
      });

      centrifuge.on('connected', (ctx) => {
        if (__DEV__) {
          console.info('[Centrifugo] Connected, client ID:', ctx.client);
        }
        setConnected(true);

        // Sync unread count khi vừa kết nối
        fetchUnreadCount()
          .then(setUnreadCount)
          .catch(() => {});
      });

      centrifuge.on('disconnected', (ctx) => {
        if (__DEV__) {
          console.info('[Centrifugo] Disconnected:', ctx.reason);
        }
        setConnected(false);
      });

      centrifuge.on('error', (ctx) => {
        if (__DEV__) {
          console.warn('[Centrifugo] Error:', ctx.error);
        }
      });

      // Subscribe personal channel
      const sub = centrifuge.newSubscription(channel);

      sub.on('publication', (ctx) => {
        const notification = ctx.data as AppNotification;

        if (__DEV__) {
          console.info('[Centrifugo] Received notification:', notification.type);
        }

        // Append vào local state + tăng badge
        addNotification(notification);

        // Hiện in-app toast
        showInfoToast(notification.title, notification.message);
      });

      sub.on('subscribed', (ctx) => {
        if (__DEV__) {
          console.info('[Centrifugo] Subscribed to:', ctx.channel);
        }
      });

      sub.on('error', (ctx) => {
        if (__DEV__) {
          console.warn('[Centrifugo] Subscription error:', ctx.error);
        }
      });

      sub.subscribe();
      centrifuge.connect();

      centrifugeRef.current = centrifuge;
      subscriptionRef.current = sub;
    } catch (err) {
      if (__DEV__) {
        console.warn('[Centrifugo] Failed to connect:', err);
      }
    }
  }

  function disconnect() {
    try {
      subscriptionRef.current?.unsubscribe();
      centrifugeRef.current?.disconnect();
    } catch {
      // ignore
    }
    subscriptionRef.current = null;
    centrifugeRef.current = null;
    tokenExpiresAtRef.current = null;
    setConnected(false);
  }

  // ── Refresh token nếu hết hạn ────────────────────────────────────────────────

  async function refreshAndReconnect() {
    const expiresAt = tokenExpiresAtRef.current;
    if (expiresAt && new Date(expiresAt) > new Date()) {
      // Token chưa hết hạn, không cần reconnect
      return;
    }

    if (__DEV__) {
      console.info('[Centrifugo] Token expired, reconnecting...');
    }

    disconnect();
    await connect();
  }

  // ── Effect: Login / Logout ───────────────────────────────────────────────────

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect();
    } else {
      disconnect();
      reset();
    }

    return () => {
      // Cleanup khi component unmount (không xảy ra với root layout)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // ── Effect: AppState (foreground/background) ─────────────────────────────────

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isAuthenticated) {
        // App quay lại foreground → kiểm tra và reconnect nếu cần
        refreshAndReconnect();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    isConnected: useNotificationStore((s) => s.isConnected),
  };
}
