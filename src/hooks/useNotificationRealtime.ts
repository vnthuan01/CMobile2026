import { queryClient } from '@/src/lib/queryClient';
import {
    fetchNotifications,
    fetchRealtimeToken,
} from '@/src/services/notificationService';
import { useAuthStore } from '@/src/store/authStore';
import { useNotificationStore } from '@/src/store/notificationStore';
import type { AppNotification } from '@/src/types/notification';
import {
    filterNotificationsForRole,
    shouldDisplayNotificationForRole,
} from '@/src/utils/notificationRoleFilter';
import { showInfoToast, showWarningToast } from '@/src/utils/toast';
import { Centrifuge, type Subscription } from 'centrifuge';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { rescueRequestKeys } from './useMyRescueRequests';
import { requestTrackingKeys } from './useRequestTracking';
import { rescueDetailKeys } from './useRescueRequestDetail';

type PublicationPayload =
  | AppNotification
  | {
      notification?: AppNotification;
      data?: AppNotification;
      payload?: AppNotification;
    }
  | null
  | undefined;

function parseNotificationPayload(
  payload: PublicationPayload,
): AppNotification | null {
  if (!payload) {
    return null;
  }

  const normalized =
    (payload as { notification?: AppNotification }).notification ??
    (payload as { data?: AppNotification }).data ??
    (payload as { payload?: AppNotification }).payload ??
    (payload as AppNotification);

  if (!normalized?.notificationId || !normalized?.type) {
    return null;
  }

  return normalized;
}

function getNotificationToastType(notificationType: string) {
  if (notificationType === 'RescueRequestInProgress') {
    return 'warning' as const;
  }
  return 'info' as const;
}

export function useNotificationRealtime() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userRole = useAuthStore((state) => state.user?.role ?? '');

  const setConnected = useNotificationStore((state) => state.setConnected);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const setRealtimeSession = useNotificationStore(
    (state) => state.setRealtimeSession,
  );
  const upsertNotification = useNotificationStore(
    (state) => state.upsertNotification,
  );
  const reset = useNotificationStore((state) => state.reset);

  const clientRef = useRef<Centrifuge | null>(null);
  const isConnectedRef = useRef(false);
  const subscriptionRef = useRef<Subscription | null>(null);
  const renewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationPollRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const clearRenewTimer = () => {
    if (renewTimerRef.current) {
      clearTimeout(renewTimerRef.current);
      renewTimerRef.current = null;
    }
  };

  const clearNotificationPoll = () => {
    if (notificationPollRef.current) {
      clearInterval(notificationPollRef.current);
      notificationPollRef.current = null;
    }
  };

  const invalidateRescueQueries = (referenceId?: string | null) => {
    queryClient.invalidateQueries({ queryKey: rescueRequestKeys.all });
    queryClient.invalidateQueries({ queryKey: rescueDetailKeys.all });
    queryClient.invalidateQueries({ queryKey: requestTrackingKeys.all });

    queryClient.refetchQueries({ queryKey: rescueRequestKeys.all, type: 'active' });
    queryClient.refetchQueries({ queryKey: rescueDetailKeys.all, type: 'active' });
    queryClient.refetchQueries({ queryKey: requestTrackingKeys.all, type: 'active' });

    if (referenceId) {
      queryClient.invalidateQueries({
        queryKey: rescueDetailKeys.detail(referenceId),
      });
      queryClient.invalidateQueries({
        queryKey: requestTrackingKeys.detail(referenceId),
      });

      queryClient.refetchQueries({
        queryKey: rescueDetailKeys.detail(referenceId),
        type: 'active',
      });
      queryClient.refetchQueries({
        queryKey: requestTrackingKeys.detail(referenceId),
        type: 'active',
      });
    }
  };

  const syncNotificationState = async () => {
    try {
      const notificationsResponse = await fetchNotifications({
        pageNumber: 1,
        pageSize: 50,
      });
      const filteredItems = filterNotificationsForRole(
        userRole,
        notificationsResponse.data ?? [],
      );

      setNotifications(filteredItems);
      setUnreadCount(filteredItems.filter((item) => !item.isRead).length);
    } catch {
      // Silent fail: user still receives realtime publications if websocket is healthy.
    }
  };

  const startNotificationPolling = () => {
    clearNotificationPoll();

    // Keep unread badge in sync even if websocket publication is delayed/missed.
    notificationPollRef.current = setInterval(() => {
      if (AppState.currentState === 'active') {
        void syncNotificationState();
      }
    }, 8000);
  };

  const teardownConnection = () => {
    clearRenewTimer();
    clearNotificationPoll();
    isConnectedRef.current = false;
    setConnected(false);

    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;

    clientRef.current?.disconnect();
    clientRef.current = null;
  };

  const handlePublication = (payload: PublicationPayload) => {
    const notification = parseNotificationPayload(payload);
    if (!notification) {
      void syncNotificationState();
      return;
    }

    if (!shouldDisplayNotificationForRole(userRole, notification)) {
      return;
    }

    upsertNotification(notification);
    invalidateRescueQueries(notification.referenceId ?? null);

    if (AppState.currentState === 'active') {
      const toastType = getNotificationToastType(notification.type);
      if (toastType === 'warning') {
        showWarningToast(notification.title, notification.message);
      } else {
        showInfoToast(notification.title, notification.message);
      }
    }

    // Ensure unread count is reconciled with server state after realtime update.
    void syncNotificationState();
  };

  const scheduleRenew = (expiresAt?: string) => {
    clearRenewTimer();
    if (!expiresAt) {
      return;
    }

    const expiresAtMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) {
      return;
    }

    const triggerInMs = Math.max(5000, expiresAtMs - Date.now() - 60000);
    renewTimerRef.current = setTimeout(() => {
      teardownConnection();
      void initRealtime();
    }, triggerInMs);
  };

  const initRealtime = async () => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    try {
      const session = await fetchRealtimeToken();
      setRealtimeSession(session);
      scheduleRenew(session.expiresAt);

      const client = new Centrifuge(session.endpoint, {
        token: session.token,
        getToken: async () => {
          const nextSession = await fetchRealtimeToken();
          setRealtimeSession(nextSession);
          scheduleRenew(nextSession.expiresAt);
          return nextSession.token;
        },
      });

      client.on('connected', () => {
        isConnectedRef.current = true;
        setConnected(true);
        void syncNotificationState();
      });

      client.on('disconnected', () => {
        isConnectedRef.current = false;
        setConnected(false);
      });

      client.on('error', () => {
        isConnectedRef.current = false;
        setConnected(false);
      });

      const subscription = client.newSubscription(session.channel);
      subscription.on('publication', (ctx) => {
        handlePublication(ctx.data as PublicationPayload);
      });

      subscription.on('subscribed', () => {
        void syncNotificationState();
      });

      subscription.subscribe();
      client.connect();

      subscriptionRef.current = subscription;
      clientRef.current = client;
      startNotificationPolling();
    } catch {
      isConnectedRef.current = false;
      setConnected(false);
      startNotificationPolling();
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      teardownConnection();
      setRealtimeSession(null);
      reset();
      return;
    }

    void initRealtime();

    return () => {
      teardownConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      if (status !== 'active' || !isAuthenticated || !accessToken) {
        return;
      }

      if (!clientRef.current) {
        void initRealtime();
        return;
      }

      if (!isConnectedRef.current) {
        clientRef.current.connect();
      }

      void syncNotificationState();
    };

    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, userRole]);
}
