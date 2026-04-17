// ── Realtime Token ────────────────────────────────────────────────────────────

export interface RealtimeTokenResponse {
  token: string;
  endpoint: string;
  channel: string;
  expiresAt: string;
}

// ── Notification Payload ──────────────────────────────────────────────────────

export type NotificationType =
  | 'RescueRequestCreated'
  | 'RescueRequestVerified'
  | 'RescueRequestAssigned'
  | 'RescueRequestInProgress'
  | string;

export interface AppNotification {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId: string | null;
  referenceType: string | null;
  metadataJson?: string | null;
  metadata?: unknown | null;
  attachmentCount?: number;
  thumbnailUrls?: string[];
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

// ── API Response ──────────────────────────────────────────────────────────────

export interface NotificationListResponse {
  data: AppNotification[];
  totalCount: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface UnreadCountResponse {
  count: number;
}
