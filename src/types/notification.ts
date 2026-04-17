import type { PaginatedResponse } from './api';

export type NotificationType =
  | 'RescueRequestCreated'
  | 'RescueRequestVerified'
  | 'RescueRequestAssigned'
  | 'RescueRequestInProgress'
  | string;

export interface NotificationMetadata {
  schemaVersion?: number;
  schemaName?: string;
  attachmentCount?: number;
  thumbnailUrls?: string[];
  [key: string]: unknown;
}

export interface AppNotification {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
  referenceType?: string | null;
  metadataJson?: string | null;
  metadata?: NotificationMetadata | null;
  attachmentCount?: number;
  thumbnailUrls?: string[];
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface RealtimeTokenResponse {
  token: string;
  endpoint: string;
  channel: string;
  expiresAt?: string;
}

export interface NotificationsQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

export type NotificationsResponse = PaginatedResponse<AppNotification>;

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}
