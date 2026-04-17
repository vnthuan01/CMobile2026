import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationList,
} from '@/src/hooks/useNotifications';
import { useNotificationStore } from '@/src/store/notificationStore';
import type { AppNotification } from '@/src/types/notification';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function getNotificationIcon(type: string): {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
} {
  switch (type) {
    case 'RescueRequestVerified':
      return { name: 'checkmark-circle', color: '#3B82F6' };
    case 'RescueRequestAssigned':
      return { name: 'people', color: '#8B5CF6' };
    case 'RescueRequestInProgress':
      return { name: 'navigate', color: '#EF4444' };
    case 'RescueRequestCreated':
      return { name: 'alert-circle', color: '#F59E0B' };
    default:
      return { name: 'notifications', color: '#6B7280' };
  }
}

// ── NotificationItem ──────────────────────────────────────────────────────────

interface NotificationItemProps {
  item: AppNotification;
  onPress: (item: AppNotification) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

function NotificationItem({ item, onPress, colors }: NotificationItemProps) {
  const icon = getNotificationIcon(item.type);

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        backgroundColor: item.isRead
          ? colors.background
          : `${colors.primary}0A`,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${icon.color}18`,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, gap: 3 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: item.isRead ? '500' : '700',
              color: colors.text,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        <Text
          style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}
          numberOfLines={2}
        >
          {item.message}
        </Text>
      </View>

      {/* Unread dot */}
      {!item.isRead && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            marginTop: 4,
            flexShrink: 0,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

// ── NotificationScreen ────────────────────────────────────────────────────────

interface NotificationScreenProps {
  onBack?: () => void;
}

export default function NotificationScreen({
  onBack,
}: NotificationScreenProps) {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  const [isRead, setIsRead] = useState<boolean | undefined>(undefined);

  // Local store (realtime nguồn)
  const storeNotifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isConnected = useNotificationStore((s) => s.isConnected);

  // API fetch (fallback + sync khi mới mở app)
  const { isLoading, refetch, isRefetching } = useNotificationList({ isRead });

  const markOneRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  // Filter local notifications theo tab
  const displayedNotifications =
    isRead === undefined
      ? storeNotifications
      : storeNotifications.filter((n) => n.isRead === isRead);

  const handlePressNotification = useCallback(
    async (item: AppNotification) => {
      // Mark as read
      if (!item.isRead) {
        await markOneRead(item.notificationId);
      }

      // Deep-link đến request detail
      if (item.referenceType === 'RescueRequest' && item.referenceId) {
        router.push(`/(tabs)/requests/${item.referenceId}` as any);
      }
    },
    [markOneRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationItem
        item={item}
        onPress={handlePressNotification}
        colors={colors}
      />
    ),
    [colors, handlePressNotification],
  );

  const ListEmpty = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
      }}
    >
      <Ionicons
        name="notifications-off-outline"
        size={56}
        color={colors.textSecondary}
        style={{ opacity: 0.5 }}
      />
      <Text style={{ fontSize: 15, color: colors.textSecondary }}>
        Chưa có thông báo nào
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{ fontSize: 20, fontWeight: '700', color: colors.text }}
            >
              Thông báo
            </Text>
            {/* Connection badge */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isConnected ? '#22C55E' : '#EF4444',
              }}
            />
          </View>
          {unreadCount > 0 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {unreadCount} chưa đọc
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAll}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: `${colors.primary}18`,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.primary,
              }}
            >
              Đọc tất cả
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {[
          { label: 'Tất cả', value: undefined },
          { label: 'Chưa đọc', value: false },
          { label: 'Đã đọc', value: true },
        ].map((tab) => {
          const active = isRead === tab.value;
          return (
            <TouchableOpacity
              key={String(tab.value)}
              onPress={() => setIsRead(tab.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: active ? colors.primary : `${colors.border}`,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: active ? colors.white : colors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {isLoading && storeNotifications.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedNotifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
