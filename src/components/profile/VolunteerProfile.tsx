import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

interface VolunteerProfileProps {
  onEdit?: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigate?: (
    screen:
      | '/profile/requests'
      | '/profile/tasks'
      | '/profile/settings'
      | '/profile/help'
      | '/profile/change-password'
      | '/profile/progress-rescue'
      | '/profile/progress-relief'
      | '/profile/dashboard-leader'
      | '/profile/report-leader'
      | '/profile/my-team',
  ) => void;
}

export default function VolunteerProfile({
  onEdit,
  onBack,
  onLogout,
  onNavigate,
}: VolunteerProfileProps) {
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header Section */}
      <View className="relative bg-secondary pb-16 pt-4 dark:bg-[#1C252E]">
        <View
          style={{ paddingTop: top }}
          className="z-20 mb-4 flex-row items-center justify-between px-4"
        >
          <View className="w-10 items-start justify-center">
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-lg font-bold text-white">Hồ sơ cá nhân</Text>
          <View className="w-10 items-end justify-center">
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                className="rounded-full bg-white/20 px-3 py-1.5 transition-colors hover:bg-white/30"
              >
                <Text className="text-xs font-semibold text-white">Sửa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View className="z-20 mt-2 items-center">
          <View className="group relative mb-3 cursor-pointer">
            <View className="h-24 w-24 rounded-full border-4 border-white/20 bg-gray-200 shadow-lg">
              {/* Placeholder for actual image */}
              <View className="flex-1 items-center justify-center rounded-full bg-blue-900/50">
                <Ionicons name="person" size={40} color="#ffffff" />
              </View>
            </View>
            <View
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-secondary bg-green-500 shadow-sm transition-transform hover:scale-110"
              accessibilityLabel="Đã xác minh"
            >
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            </View>
          </View>
          <Text className="mb-1 text-xl font-bold text-white">
            {user?.user_name || user?.email}
          </Text>
          <Text className="mb-1 text-sm text-blue-100">ID: VN-8821</Text>
          <View className="rounded-full bg-white/20 px-2.5 py-0.5">
            <Text className="text-xs font-medium text-white">
              Tình nguyện viên cấp 2
            </Text>
          </View>
        </View>

        {/* Bottom Curve */}
        <View className="absolute bottom-[-1px] left-0 h-10 w-full rounded-tl-3xl rounded-tr-3xl bg-background-light dark:bg-background-dark" />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="z-10 -mt-2 flex-1 px-4"
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-4">
          {/* Availability Toggle */}
          <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
            <View className="flex-1">
              <View className="mb-1 flex-row items-center gap-2">
                <View className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                  <Ionicons name="flash" size={20} color="#2E7D32" />
                </View>
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  Trạng thái sẵn sàng
                </Text>
              </View>
              <Text className="pl-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Nhận thông báo điều phối khi có thiên tai khẩn cấp.
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#e5e7eb', true: '#2E7D32' }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>

          {/* Skills */}
          <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  Team của tôi
                </Text>
                <Text className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  Xem trưởng nhóm, moderator, danh sách thành viên và kỹ năng
                  của team.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/my-team')}
                className="rounded-xl bg-primary px-4 py-2.5"
              >
                <Text className="font-semibold text-white">Mở</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Skills */}
          <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-1 rounded-full bg-primary" />
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  Kỹ năng chuyên môn
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-primary hover:underline">
                  Thêm mới
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {[
                { icon: 'medkit', label: 'Sơ cứu y tế' },
                { icon: 'water', label: 'Lặn cứu hộ' },
                { icon: 'car', label: 'Lái xe tải' },
                { icon: 'body', label: 'Bơi lội' },
                { icon: 'map', label: 'Thông thạo địa hình' },
              ].map((skill, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <Ionicons
                    name={skill.icon as any}
                    size={20}
                    color="#1565C0"
                  />
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {skill.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Certifications and Badges */}
          <View className="pt-2">
            <View className="mb-3 flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-1 rounded-full bg-primary" />
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  Chứng chỉ & Huy hiệu
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-xs font-medium text-gray-400 hover:text-primary dark:text-gray-500">
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-3 pb-4"
            >
              <View className="w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
                <View className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-100 bg-yellow-50 dark:border-yellow-900/20 dark:bg-yellow-900/10">
                  <Ionicons name="medal" size={24} color="#CA8A04" />
                </View>
                <View className="w-full text-center">
                  <Text
                    className="truncate text-center text-xs font-bold leading-tight text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    Cứu hộ 2023
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] font-medium text-yellow-600 dark:text-yellow-500">
                    Xuất sắc
                  </Text>
                </View>
              </View>
              <View className="w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
                <View className="flex h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-red-50 dark:border-red-900/20 dark:bg-red-900/10">
                  <Ionicons name="shield-checkmark" size={24} color="#DA251D" />
                </View>
                <View className="w-full text-center">
                  <Text
                    className="truncate text-center text-xs font-bold leading-tight text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    Tập huấn Y tế
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] font-medium text-primary dark:text-red-400">
                    Hoàn thành
                  </Text>
                </View>
              </View>
              <View className="w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
                <View className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50 dark:border-blue-900/20 dark:bg-blue-900/10">
                  <Ionicons name="water" size={24} color="#1565C0" />
                </View>
                <View className="w-full text-center">
                  <Text
                    className="truncate text-center text-xs font-bold leading-tight text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    Cứu nạn Thủy
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] font-medium text-secondary dark:text-blue-400">
                    Cơ bản
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Contact Information */}
          <View className="pb-4">
            <View className="mb-3 flex-row items-center gap-2 px-1">
              <View className="h-5 w-1 rounded-full bg-primary" />
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                Thông tin liên hệ
              </Text>
            </View>
            <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
              {/* Phone */}
              <View className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50">
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name="call"
                    size={18}
                    color="#1565C0"
                    className="dark:text-gray-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Số điện thoại
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    0912 *** 789
                  </Text>
                </View>
                <TouchableOpacity className="rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-900/20">
                  <Text className="text-xs font-bold text-secondary">Hiện</Text>
                </TouchableOpacity>
              </View>

              {/* Email */}
              <View className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50">
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name="mail"
                    size={18}
                    color="#1565C0"
                    className="dark:text-gray-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Email
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.email}
                  </Text>
                </View>
              </View>

              {/* Emergency Contact */}
              <View className="flex-row items-center gap-4 bg-red-50/50 p-4 dark:bg-red-900/10">
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <Ionicons
                    name="warning"
                    size={18}
                    color="#DA251D"
                    className="dark:text-red-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400/70">
                    Liên hệ khẩn cấp
                  </Text>
                  <Text className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Chị Lan (Vợ) - 0988 123 456
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Section */}
          <View className="pb-4">
            <View className="mb-3 flex-row items-center gap-2 px-1">
              <View className="h-5 w-1 rounded-full bg-primary" />
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                Chức năng & Hệ thống
              </Text>
            </View>
            <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#1a2632]">
              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/tasks')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name="clipboard"
                    size={18}
                    color="#1565C0"
                    className="dark:text-gray-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Theo dõi nhiệm vụ
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Xem và cập nhật trạng thái nhiệm vụ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/progress-rescue')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                  <Ionicons name="boat" size={18} color="#DA251D" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tiến độ cứu hộ
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Báo cáo tiến độ nhiệm vụ cứu hộ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/progress-relief')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
                  <Ionicons name="cube" size={18} color="#ea580c" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tiến độ cứu trợ
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Báo cáo tiến độ phân phối hàng cứu trợ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/dashboard-leader')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <Ionicons name="people" size={18} color="#1565C0" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Dashboard nhóm trưởng
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Quản lý nhóm và phân công nhiệm vụ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/report-leader')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                  <Ionicons name="stats-chart" size={18} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Báo cáo tổng hợp
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Gửi báo cáo tổng hợp của nhóm
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/requests')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name="document-text"
                    size={18}
                    color="#1565C0"
                    className="dark:text-gray-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Theo dõi yêu cầu
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Xem trạng thái yêu cầu của bạn
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/change-password')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons name="lock-closed" size={18} color="#1565C0" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Đổi mật khẩu
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Cập nhật mật khẩu bảo mật
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/settings')}
                className="flex-row items-center gap-4 border-b border-gray-50 p-4 dark:border-gray-800/50"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name="settings"
                    size={18}
                    color="#1565C0"
                    className="dark:text-gray-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Cài đặt ứng dụng
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/help')}
                className="flex-row items-center gap-4 p-4"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name="help-circle"
                    size={18}
                    color="#1565C0"
                    className="dark:text-gray-400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Trung tâm trợ giúp
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View className="mb-4 mt-2">
            <TouchableOpacity
              onPress={onLogout}
              className="flex-row items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-4 shadow-sm transition-colors hover:bg-red-50 dark:border-red-900/30 dark:bg-[#1a2632] dark:hover:bg-red-900/10"
            >
              <Ionicons name="log-out-outline" size={20} color="#DA251D" />
              <Text className="font-bold text-[#DA251D]">Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
