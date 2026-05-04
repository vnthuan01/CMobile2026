import type { AppNotification, NotificationType } from '../types/notification';

const USER_ONLY_NOTIFICATION_TYPES = new Set<NotificationType>([
  'RescueRequestVerified',
  'RescueRequestAssigned',
  'RescueRequestInProgress',
]);

function normalizeRole(role?: string | null): string {
  return String(role ?? '')
    .trim()
    .toLowerCase();
}

export function shouldDisplayNotificationForRole(
  role: string | null | undefined,
  notification: AppNotification,
): boolean {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole !== 'volunteer') {
    return true;
  }

  return !USER_ONLY_NOTIFICATION_TYPES.has(notification.type);
}

export function filterNotificationsForRole(
  role: string | null | undefined,
  notifications: AppNotification[],
): AppNotification[] {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  return notifications.filter((notification) =>
    shouldDisplayNotificationForRole(role, notification),
  );
}
