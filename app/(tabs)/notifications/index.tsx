import Header from '@/src/components/header/header';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '@/src/services/notificationService';
import { useAuthStore } from '@/src/store/authStore';
import { useNotificationStore } from '@/src/store/notificationStore';
import type { AppNotification } from '@/src/types/notification';
import { filterNotificationsForRole } from '@/src/utils/notificationRoleFilter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

function formatNotificationTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getPreviewThumbnails(item: AppNotification): string[] {
  const byRoot = item.thumbnailUrls ?? [];
  const byMetadata = Array.isArray(item.metadata?.thumbnailUrls)
    ? item.metadata.thumbnailUrls
    : [];

  const merged = [...byRoot, ...byMetadata].filter((url): url is string =>
    Boolean(url && typeof url === 'string'),
  );

  return Array.from(new Set(merged)).slice(0, 3);
}

export default function NotificationsScreen() {
  const router = useRouter();
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const userRole = useAuthStore((state) => state.user?.role ?? '');

  const items = useNotificationStore((state) => state.items);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const markAsReadLocal = useNotificationStore(
    (state) => state.markAsReadLocal,
  );
  const markAllAsReadLocal = useNotificationStore(
    (state) => state.markAllAsReadLocal,
  );
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  const loadNotifications = useCallback(
    async (isPullToRefresh = false) => {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetchNotifications({
          pageNumber: 1,
          pageSize: 50,
        });
        const filteredItems = filterNotificationsForRole(
          userRole,
          response.data ?? [],
        );
        setNotifications(filteredItems);
        const unread = filteredItems.filter(
          (item) => !item.isRead,
        ).length;
        setUnreadCount(unread);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setNotifications, setUnreadCount, userRole],
  );

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  const onPressNotification = useCallback(
    async (item: AppNotification) => {
      if (!item.isRead) {
        markAsReadLocal(item.notificationId);
        try {
          await markNotificationAsRead(item.notificationId);
        } catch {
          void loadNotifications();
        }
      }

      if (item.referenceId) {
        router.push({
          pathname: '/requests/[requestId]',
          params: { requestId: item.referenceId },
        });
      }
    },
    [loadNotifications, markAsReadLocal, router],
  );

  const onMarkAllAsRead = useCallback(async () => {
    if (markAllLoading || unreadCount <= 0) {
      return;
    }

    setMarkAllLoading(true);
    markAllAsReadLocal();

    try {
      await markAllNotificationsAsRead();
    } catch {
      void loadNotifications();
    } finally {
      setMarkAllLoading(false);
    }
  }, [loadNotifications, markAllAsReadLocal, markAllLoading, unreadCount]);

  const rightAction = useMemo(
    () => (
      <TouchableOpacity
        onPress={onMarkAllAsRead}
        disabled={markAllLoading || unreadCount <= 0}
        className="rounded-full px-3 py-2"
        style={{
          backgroundColor:
            markAllLoading || unreadCount <= 0
              ? colors.surface
              : `${colors.primary}1A`,
        }}
      >
        <Text
          className="text-xs font-semibold"
          style={{
            color:
              markAllLoading || unreadCount <= 0
                ? colors.textSecondary
                : colors.primary,
          }}
        >
          Đọc tất cả
        </Text>
      </TouchableOpacity>
    ),
    [
      colors.primary,
      colors.surface,
      colors.textSecondary,
      markAllLoading,
      onMarkAllAsRead,
      unreadCount,
    ],
  );

  const renderItem = ({ item }: { item: AppNotification }) => {
    const thumbnails = getPreviewThumbnails(item);

    return (
      <TouchableOpacity
        onPress={() => void onPressNotification(item)}
        className="mb-3 rounded-xl border p-3"
        style={{
          backgroundColor: item.isRead ? colors.card : `${colors.primary}0D`,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text
              className="text-sm font-bold"
              style={{ color: colors.text }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              className="mt-1 text-sm"
              style={{ color: colors.textSecondary }}
              numberOfLines={3}
            >
              {item.message}
            </Text>
            <Text
              className="mt-2 text-xs"
              style={{ color: colors.textSecondary }}
            >
              {formatNotificationTime(item.createdAt)}
            </Text>
          </View>

          {!item.isRead ? (
            <View
              className="mt-1 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
          ) : null}
        </View>

        {thumbnails.length > 0 ? (
          <View className="mt-3 flex-row gap-2">
            {thumbnails.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                className="h-14 flex-1 rounded-lg"
                resizeMode="cover"
              />
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header
        title="Thông báo"
        subtitle={`Chưa đọc: ${unreadCount}`}
        onBack={() => router.back()}
        rightAction={rightAction}
      />

      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-3 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Đang tải thông báo...
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.notificationId}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomInset }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadNotifications(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View
              className="mt-8 items-center rounded-xl border p-5"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Ionicons
                name="notifications-off-outline"
                size={26}
                color={colors.textSecondary}
              />
              <Text
                className="mt-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Chưa có thông báo nào.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
