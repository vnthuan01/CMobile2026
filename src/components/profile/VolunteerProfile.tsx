import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '@/src/context/ThemeContext';

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
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [isAvailable, setIsAvailable] = useState(true);
  const headerBg = colors.secondary;
  const cardBg = colors.card;
  const subtleBg = colors.surface;
  const iconAccent = colors.secondary;
  const neutralBorder = colors.border;
  const dangerSoft = `${colors.status.error}14`;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header Section */}
      <View className="relative pb-16 pt-4" style={{ backgroundColor: headerBg }}>
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
                <Ionicons name="chevron-back" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-lg font-bold" style={{ color: colors.white }}>Hồ sơ cá nhân</Text>
          <View className="w-10 items-end justify-center">
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                className="rounded-full bg-white/20 px-3 py-1.5 transition-colors hover:bg-white/30"
              >
                <Text className="text-xs font-semibold" style={{ color: colors.white }}>Sửa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View className="z-20 mt-2 items-center">
          <View className="group relative mb-3 cursor-pointer">
              <View className="h-24 w-24 rounded-full border-4 border-white/20 shadow-lg" style={{ backgroundColor: subtleBg }}>
                {/* Placeholder for actual image */}
                <View className="flex-1 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.black}40` }}>
                  <Ionicons name="person" size={40} color={colors.white} />
                </View>
              </View>
              <View
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-110"
              style={{ borderColor: colors.secondary, backgroundColor: colors.status.completed }}
              accessibilityLabel="Đã xác minh"
            >
              <Ionicons name="checkmark" size={14} color={colors.white} />
            </View>
          </View>
          <Text className="mb-1 text-xl font-bold" style={{ color: colors.white }}>
            {user?.user_name || user?.email}
          </Text>
          <Text className="mb-1 text-sm" style={{ color: `${colors.white}CC` }}>ID: VN-8821</Text>
          <View className="rounded-full bg-white/20 px-2.5 py-0.5">
            <Text className="text-xs font-medium" style={{ color: colors.white }}>
              Tình nguyện viên cấp 2
            </Text>
          </View>
        </View>

        {/* Bottom Curve */}
        <View className="absolute bottom-[-1px] left-0 h-10 w-full rounded-tl-3xl rounded-tr-3xl" style={{ backgroundColor: colors.background }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="z-10 -mt-2 flex-1 px-4"
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-4">
          {/* Availability Toggle */}
          <View className="flex-row items-center justify-between gap-4 rounded-2xl border p-5 shadow-sm" style={{ borderColor: colors.border, backgroundColor: cardBg }}>
            <View className="flex-1">
              <View className="mb-1 flex-row items-center gap-2">
                <View className="rounded-full p-1.5" style={{ backgroundColor: `${colors.status.completed}22` }}>
                  <Ionicons name="flash" size={20} color={colors.status.completed} />
                </View>
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  Trạng thái sẵn sàng
                </Text>
              </View>
              <Text className="pl-1 text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                Nhận thông báo điều phối khi có thiên tai khẩn cấp.
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: colors.border, true: colors.status.completed }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* Skills */}
          <View className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  Team của tôi
                </Text>
                <Text className="mt-1 text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
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
          <View className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-1 rounded-full bg-primary" />
                <Text className="text-base font-bold" style={{ color: colors.text }}>
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
                  className="flex-row items-center gap-2 rounded-xl border px-3 py-2"
                  style={{ borderColor: neutralBorder, backgroundColor: colors.surface }}
                >
                  <Ionicons
                    name={skill.icon as any}
                    size={20}
                    color={iconAccent}
                  />
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
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
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  Chứng chỉ & Huy hiệu
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-3 pb-4"
            >
              <View className="w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
                <View className="flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: `${colors.status.pending}33`, backgroundColor: `${colors.status.pending}14` }}>
                  <Ionicons name="medal" size={24} color={colors.status.pending} />
                </View>
                <View className="w-full text-center">
                  <Text
                    className="truncate text-center text-xs font-bold leading-tight"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    Cứu hộ 2023
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] font-medium" style={{ color: colors.status.pending }}>
                    Xuất sắc
                  </Text>
                </View>
              </View>
              <View className="w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
                <View className="flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: `${colors.status.error}33`, backgroundColor: `${colors.status.error}14` }}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.status.error} />
                </View>
                <View className="w-full text-center">
                  <Text
                    className="truncate text-center text-xs font-bold leading-tight"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    Tập huấn Y tế
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] font-medium" style={{ color: colors.primary }}>
                    Hoàn thành
                  </Text>
                </View>
              </View>
              <View className="w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
                <View className="flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: `${iconAccent}33`, backgroundColor: `${iconAccent}14` }}>
                  <Ionicons name="water" size={24} color={iconAccent} />
                </View>
                <View className="w-full text-center">
                  <Text
                    className="truncate text-center text-xs font-bold leading-tight"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    Cứu nạn Thủy
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] font-medium" style={{ color: colors.secondary }}>
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
               <Text className="text-base font-bold" style={{ color: colors.text }}>
                 Thông tin liên hệ
               </Text>
             </View>
            <View className="overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
              {/* Phone */}
              <View className="flex-row items-center gap-4 border-b p-4" style={{ borderColor: neutralBorder }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name="call"
                    size={18}
                    color={iconAccent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                    Số điện thoại
                  </Text>
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    0912 *** 789
                  </Text>
                </View>
                <TouchableOpacity className="rounded-lg px-3 py-1.5" style={{ backgroundColor: `${colors.secondary}18` }}>
                  <Text className="text-xs font-bold" style={{ color: colors.secondary }}>Hiện</Text>
                </TouchableOpacity>
              </View>

              {/* Email */}
              <View className="flex-row items-center gap-4 border-b p-4" style={{ borderColor: neutralBorder }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name="mail"
                    size={18}
                    color={iconAccent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                    Email
                  </Text>
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              {/* Emergency Contact */}
              <View className="flex-row items-center gap-4 p-4" style={{ backgroundColor: dangerSoft }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.status.error}22` }}>
                  <Ionicons
                    name="warning"
                    size={18}
                    color={colors.status.error}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.status.error }}>
                    Liên hệ khẩn cấp
                  </Text>
                  <Text className="text-sm font-semibold" style={{ color: colors.status.error }}>
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
              <Text className="text-base font-bold" style={{ color: colors.text }}>
                Chức năng & Hệ thống
              </Text>
            </View>
            <View className="overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: neutralBorder, backgroundColor: cardBg }}>
              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/tasks')}
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name="clipboard"
                    size={18}
                    color={iconAccent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Theo dõi nhiệm vụ
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Xem và cập nhật trạng thái nhiệm vụ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onNavigate?.('/profile/progress-rescue')} className="flex-row items-center gap-4 border-b p-4" style={{ borderColor: neutralBorder }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.status.error}18` }}>
                  <Ionicons name="boat" size={18} color={colors.status.error} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Tiến độ cứu hộ
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Báo cáo tiến độ nhiệm vụ cứu hộ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onNavigate?.('/profile/progress-relief')} className="flex-row items-center gap-4 border-b p-4" style={{ borderColor: neutralBorder }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.status.pending}18` }}>
                  <Ionicons name="cube" size={18} color={colors.status.pending} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Tiến độ cứu trợ
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Báo cáo tiến độ phân phối hàng cứu trợ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onNavigate?.('/profile/dashboard-leader')} className="flex-row items-center gap-4 border-b p-4" style={{ borderColor: neutralBorder }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconAccent}18` }}>
                  <Ionicons name="people" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Dashboard nhóm trưởng
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Quản lý nhóm và phân công nhiệm vụ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onNavigate?.('/profile/report-leader')} className="flex-row items-center gap-4 border-b p-4" style={{ borderColor: neutralBorder }}>
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.status.completed}18` }}>
                  <Ionicons name="stats-chart" size={18} color={colors.status.completed} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Báo cáo tổng hợp
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Gửi báo cáo tổng hợp của nhóm
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/requests')}
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name="document-text"
                    size={18}
                    color={iconAccent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Theo dõi yêu cầu
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Xem trạng thái yêu cầu của bạn
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/change-password')}
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="lock-closed" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Đổi mật khẩu
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Cập nhật mật khẩu bảo mật
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/settings')}
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name="settings"
                    size={18}
                    color={iconAccent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Cài đặt ứng dụng
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/help')}
                className="flex-row items-center gap-4 p-4"
              >
                <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name="help-circle"
                    size={18}
                    color={iconAccent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Trung tâm trợ giúp
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View className="mb-4 mt-2">
            <TouchableOpacity
              onPress={onLogout}
              className="flex-row items-center justify-center gap-2 rounded-xl border py-4 shadow-sm"
              style={{ borderColor: `${colors.status.error}33`, backgroundColor: cardBg }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
              <Text className="font-bold" style={{ color: colors.status.error }}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
