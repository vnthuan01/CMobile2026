import '@/global.css';
import ViewRequestRescueScreen from '@/src/components/user/ViewRequestRescueScreen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UserScreen = 'home' | 'track';

export default function CitizenHome() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<UserScreen>('home');
  //   const user = useAuthStore((s) => s.user);

  if (currentScreen === 'track') {
    return <ViewRequestRescueScreen onBack={() => setCurrentScreen('home')} />;
  }

  return (
    <ScrollView
      style={{ paddingTop: top, paddingBottom: bottom + 96 }}
      className="bg-background-light"
    >
      {/* HEADER */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <Text className="text-xl font-bold">Theo dõi yêu cầu</Text>
        <Text className="mt-1 text-sm text-text-secondary">
          Danh sách yêu cầu cứu trợ của bạn
        </Text>
      </View>

      {/* Active Request */}
      <View className="mt-4 px-4">
        <Text className="mb-3 text-base font-bold">Đang hoạt động</Text>
        <TouchableOpacity
          onPress={() => setCurrentScreen('track')}
          className="overflow-hidden rounded-xl bg-white shadow-sm"
        >
          {/* Map Preview */}
          <View className="h-32 items-center justify-center bg-gray-200">
            <Ionicons name="map" size={40} color="#6b7280" />
          </View>

          {/* Request Info */}
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="mb-2 flex-row items-center gap-2">
                  <View className="rounded-full bg-green-100 px-2 py-0.5">
                    <Text className="text-xs font-bold text-green-700">
                      Đang xử lý
                    </Text>
                  </View>
                  <View className="rounded-full bg-amber-100 px-2 py-0.5">
                    <Text className="text-xs font-bold text-amber-700">
                      Khẩn cấp
                    </Text>
                  </View>
                </View>
                <Text className="text-lg font-bold">Yêu cầu cứu trợ #001</Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  Lương thực, Y tế
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6b7280" />
            </View>

            {/* Status */}
            <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-blue-50 p-3">
              <Ionicons name="car" size={20} color="#DA251D" />
              <Text className="flex-1 text-sm font-medium text-primary">
                Đội cứu hộ đang đến - Dự kiến 15 phút
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Past Requests */}
      <View className="mt-6 px-4">
        <Text className="mb-3 text-base font-bold">Lịch sử</Text>

        <View className="gap-3">
          <RequestHistoryItem
            id="#002"
            status="Hoàn thành"
            statusColor="green"
            type="Cứu hộ"
            date="15/01/2026"
          />
          <RequestHistoryItem
            id="#003"
            status="Đã hủy"
            statusColor="red"
            type="Chỗ ở"
            date="14/01/2026"
          />
        </View>
      </View>

      {/* Emergency Button */}
      <View className="mt-8 px-4">
        <TouchableOpacity className="h-16 flex-row items-center justify-center gap-3 rounded-xl bg-red-600">
          <Ionicons name="warning" size={26} color="#fff" />
          <Text className="text-xl font-black text-white">SOS – KHẨN CẤP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/donate')}
          className="mt-4 h-16 flex-row items-center justify-center gap-3 rounded-xl border border-primary bg-white"
        >
          <Ionicons name="heart" size={26} color="#DA251D" />
          <Text className="text-xl font-black text-primary">
            ỦNG HỘ CỨU TRỢ
          </Text>
        </TouchableOpacity>

        <Text className="mt-2 text-center text-xs text-gray-400">
          Nhấn để gửi tín hiệu khẩn cấp hoặc đóng góp cứu trợ
        </Text>
      </View>
    </ScrollView>
  );
}

function RequestHistoryItem({
  id,
  status,
  statusColor,
  type,
  date,
}: {
  id: string;
  status: string;
  statusColor: 'green' | 'red' | 'gray';
  type: string;
  date: string;
}) {
  const bgColor = statusColor === 'green' ? 'bg-green-50' : 'bg-gray-50';
  const textColor =
    statusColor === 'green' ? 'text-green-700' : 'text-gray-700';

  return (
    <TouchableOpacity className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <View className={`rounded-full ${bgColor} px-2 py-0.5`}>
            <Text className={`text-xs font-bold ${textColor}`}>{status}</Text>
          </View>
        </View>
        <Text className="font-bold">{id}</Text>
        <Text className="mt-0.5 text-sm text-text-secondary">
          {type} • {date}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
}
