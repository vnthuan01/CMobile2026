import '@/global.css';
import MemberCard, { TeamMember } from '@/src/components/common/MemberCard';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardTeamLeaderScreenProps {
  onBack?: () => void;
  onAllocateTask?: () => void;
  onViewMissionDetail?: () => void;
}

const FILTER_CHIPS = ['Tất cả', 'Sẵn sàng', 'Y tế', 'Cứu hộ', 'Hậu cần'];

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    role: 'Y tế',
    status: 'ready',
    distance: 'Cách 500m',
    initials: 'NA',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    role: 'Hậu cần',
    status: 'busy',
    location: 'Tại trạm chỉ huy',
    initials: 'TB',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    role: 'Cứu hộ',
    status: 'ready',
    distance: 'Cách 1.2km',
    initials: 'LC',
  },
  {
    id: '4',
    name: 'Phạm Văn D',
    role: 'Lái xe',
    status: 'break',
    location: 'Đang về trạm',
    initials: 'PD',
  },
  {
    id: '5',
    name: 'Hoàng Thị E',
    role: 'Y tế',
    status: 'ready',
    distance: 'Cách 300m',
    initials: 'HE',
  },
];

export default function DashboardTeamLeaderScreen({
  onBack,
  onAllocateTask,
  onViewMissionDetail,
}: DashboardTeamLeaderScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [activeChip, setActiveChip] = useState(0);

  const filteredMembers =
    activeChip === 0
      ? MOCK_MEMBERS
      : activeChip === 1
        ? MOCK_MEMBERS.filter((m) => m.status === 'ready')
        : MOCK_MEMBERS.filter((m) => m.role === FILTER_CHIPS[activeChip]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top,
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }}
        className="flex-row items-center justify-between border-b px-4 pb-2 shadow-sm"
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              borderWidth: 2,
              borderColor: `${colors.primary}30`,
            }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: colors.textSecondary }}
            >
              LM
            </Text>
          </View>
          <View>
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              Xin chào,
            </Text>
            <Text
              className="text-base font-bold leading-tight"
              style={{ color: colors.text }}
            >
              Lê Văn Minh
            </Text>
          </View>
        </View>
        <TouchableOpacity className="relative h-10 w-10 items-center justify-center rounded-full">
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.textSecondary}
          />
          <View
            className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2"
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.card,
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 100 }}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Current Mission Section */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Nhiệm vụ hiện tại
            </Text>
            <TouchableOpacity
              onPress={onViewMissionDetail}
              className="flex-row items-center gap-1"
            >
              <Text
                className="text-sm font-medium"
                style={{ color: colors.secondary }}
              >
                Chi tiết
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <View
            className="rounded-2xl border p-5 shadow-sm"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View className="mb-4 flex-row gap-4">
              <View
                className="h-20 w-20 shrink-0 items-center justify-center rounded-xl shadow-sm"
                style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}
              >
                <Ionicons name="water" size={36} color="#6b7280" />
              </View>
              <View className="flex-1 flex-col justify-between py-0.5">
                <View>
                  <View
                    className="mb-1.5 self-start rounded-full border px-2.5 py-0.5"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(220,38,38,0.15)'
                        : '#fef2f2',
                      borderColor: isDark ? 'rgba(220,38,38,0.3)' : '#fecaca',
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: colors.primary }}
                    >
                      Ưu tiên cao
                    </Text>
                  </View>
                  <Text
                    className="text-lg font-bold leading-tight"
                    style={{ color: colors.text }}
                  >
                    Cứu trợ vùng lũ A
                  </Text>
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      Huyện Lệ Thủy, Quảng Bình
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progress */}
            <View className="mb-4">
              <View className="mb-1 flex-row justify-between">
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Tiến độ chung
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.primary }}
                >
                  65%
                </Text>
              </View>
              <View
                className="h-2.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: '65%',
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            </View>

            {/* Footer info */}
            <View
              className="flex-row items-center justify-between border-t pt-3"
              style={{ borderTopColor: colors.border }}
            >
              <View className="flex-row items-center">
                {['NA', 'TB', 'LC'].map((initials, i) => (
                  <View
                    key={i}
                    className="h-8 w-8 items-center justify-center rounded-full border-2"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#e5e7eb',
                      borderColor: colors.card,
                      marginLeft: i > 0 ? -8 : 0,
                      zIndex: 3 - i,
                    }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      {initials}
                    </Text>
                  </View>
                ))}
                <View
                  className="ml-[-8px] h-8 w-8 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(21,101,192,0.2)'
                      : '#e3f2fd',
                    borderColor: colors.card,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.secondary }}
                  >
                    +9
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Cập nhật 15p trước
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Team Members Section */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Thành viên nhóm{' '}
              <Text
                className="text-base font-normal"
                style={{ color: colors.textSecondary }}
              >
                (12)
              </Text>
            </Text>
            <Ionicons name="search" size={22} color={colors.textSecondary} />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
          >
            {FILTER_CHIPS.map((chip, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveChip(i)}
                className="shrink-0 items-center justify-center rounded-full border px-4 py-1.5"
                style={{
                  backgroundColor:
                    activeChip === i
                      ? isDark
                        ? '#fff'
                        : '#111418'
                      : colors.card,
                  borderColor: activeChip === i ? 'transparent' : colors.border,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color:
                      activeChip === i
                        ? isDark
                          ? '#111418'
                          : '#fff'
                        : colors.textSecondary,
                  }}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Member List */}
          <View className="gap-3">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Sticky Footer */}
      <StickyFooterButton
        title="Phân công nhiệm vụ"
        icon="add-circle"
        backgroundColor={colors.secondary}
        onPress={onAllocateTask}
      />
    </View>
  );
}
