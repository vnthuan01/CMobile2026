import '@/global.css';
import UpdateTaskStatusScreen from '@/src/components/volunteer/UpdateTaskStatusScreen';
import ViewTasksScreen from '@/src/components/volunteer/ViewTasksScreen';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type VolunteerScreen = 'home' | 'tasks' | 'update';

export default function VolunteerHome() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
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
      className="bg-background-light"
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="person" size={20} color="#DA251D" />
          </View>
          <View>
            <Text className="text-lg font-bold">
              Xin chào, {user?.user_name}
            </Text>
            <Text className="text-xs text-text-secondary">
              Tình nguyện viên
            </Text>
          </View>
        </View>

        <Ionicons name="notifications-outline" size={22} />
      </View>

      {/* STATUS */}
      <View className="mt-4 px-4">
        <View className="flex-row rounded-xl bg-surface p-1">
          <StatusButton label="Sẵn sàng" active />
          <StatusButton label="Bận" />
        </View>
      </View>

      {/* CURRENT MISSION */}
      <View className="mt-6 px-4">
        <Text className="mb-2 text-xl font-bold">Nhiệm vụ hiện tại</Text>

        <View className="overflow-hidden rounded-xl bg-white shadow-sm">
          <View className="h-40 items-center justify-center bg-gray-200">
            <Ionicons name="map" size={32} color="#6b7280" />
          </View>

          <View className="gap-3 p-4">
            <Text className="text-lg font-bold">
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
              <Ionicons name="arrow-forward" color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold">Thao tác nhanh</Text>

        <View className="flex-row flex-wrap gap-3">
          <QuickAction icon="alert-circle" label="Báo cáo sự cố" />
          <QuickAction icon="call" label="Gọi chỉ huy" />
          <QuickAction icon="map" label="Bản đồ" />
          <QuickAction
            icon="checkmark-done"
            label="Cập nhật trạng thái"
            onPress={() => setCurrentScreen('update')}
          />
          <QuickAction
            icon="heart"
            label="Ủng hộ cứu trợ"
            onPress={() => router.push('/donate')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function StatusButton({ label, active }: { label: string; active?: boolean }) {
  return (
    <View
      className={`h-10 flex-1 items-center justify-center rounded-lg ${
        active ? 'bg-white' : ''
      }`}
    >
      <Text className={active ? 'font-bold text-primary' : 'text-gray-400'}>
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-28 w-[48%] items-center justify-center gap-2 rounded-xl bg-white shadow-sm"
    >
      <Ionicons name={icon} size={24} color="#DA251D" />
      <Text className="text-sm font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}
