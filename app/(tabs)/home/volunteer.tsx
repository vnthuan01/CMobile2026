import '@/global.css';
import UpdateTaskStatusScreen from '@/src/components/volunteer/UpdateTaskStatusScreen';
import ViewTasksScreen from '@/src/components/volunteer/ViewTasksScreen';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThemeColors } from '@/src/constants/theme';

type VolunteerScreen = 'home' | 'tasks' | 'update';

export default function VolunteerHome() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [currentScreen, setCurrentScreen] = useState<VolunteerScreen>('home');

  if (currentScreen === 'tasks') {
    return <ViewTasksScreen onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'update') {
    return <UpdateTaskStatusScreen onBack={() => setCurrentScreen('home')} />;
  }

  return (
    <ScrollView
      style={{ paddingTop: top, paddingBottom: bottom + 96 }}
      className=""
      contentContainerStyle={{ paddingTop: top, paddingBottom: bottom + 96, backgroundColor: colors.background }}
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 shadow-sm" style={{ backgroundColor: colors.card }}>
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Xin chào, {user?.user_name}
            </Text>
            <Text className="text-xs text-text-secondary">
              Tình nguyện viên
            </Text>
          </View>
        </View>

        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </View>

      {/* STATUS */}
      <View className="mt-4 px-4">
        <View className="flex-row rounded-xl bg-surface p-1">
          <StatusButton label="Sẵn sàng" active colors={colors} />
          <StatusButton label="Bận" colors={colors} />
        </View>
      </View>

      {/* CURRENT MISSION */}
      <View className="mt-6 px-4">
        <Text className="mb-2 text-xl font-bold" style={{ color: colors.text }}>Nhiệm vụ hiện tại</Text>

        <View className="overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: colors.card }}>
          <View className="h-40 items-center justify-center" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="map" size={32} color={colors.textSecondary} />
          </View>

          <View className="gap-3 p-4">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Cứu trợ lương thực – Khu vực A
            </Text>
            <Text className="text-sm text-text-secondary">
              Cung cấp nước sạch và thực phẩm cho người dân bị cô lập.
            </Text>

            <TouchableOpacity
              onPress={() => setCurrentScreen('tasks')}
              className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-primary"
            >
              <Text className="font-bold text-white">Bắt đầu nhiệm vụ</Text>
              <Ionicons name="arrow-forward" color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Thao tác nhanh</Text>

        <View className="flex-row flex-wrap gap-3">
          <QuickAction icon="alert-circle" label="Báo cáo sự cố" colors={colors} />
          <QuickAction icon="call" label="Gọi chỉ huy" colors={colors} />
          <QuickAction icon="map" label="Bản đồ" colors={colors} />
          <QuickAction
            icon="checkmark-done"
            label="Cập nhật trạng thái"
            colors={colors}
            onPress={() => setCurrentScreen('update')}
          />
          <QuickAction
            icon="heart"
            label="Ủng hộ cứu trợ"
            colors={colors}
            onPress={() => router.push('/donate')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function StatusButton({ label, active, colors }: { label: string; active?: boolean; colors: any }) {
  return (
    <View
      className="h-10 flex-1 items-center justify-center rounded-lg"
      style={{ backgroundColor: active ? colors.card : 'transparent' }}
    >
      <Text className={active ? 'font-bold' : ''} style={{ color: active ? colors.primary : colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-28 w-[48%] items-center justify-center gap-2 rounded-xl shadow-sm"
      style={{ backgroundColor: colors.card }}
    >
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text className="text-sm font-semibold" style={{ color: colors.text }}>{label}</Text>
    </TouchableOpacity>
  );
}
