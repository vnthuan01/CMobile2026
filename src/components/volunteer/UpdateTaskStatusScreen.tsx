import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StatusType = 'on_the_way' | 'delivered' | 'failed';

interface UpdateTaskStatusScreenProps {
  onBack?: () => void;
}

export default function UpdateTaskStatusScreen({
  onBack,
}: UpdateTaskStatusScreenProps = {}) {
  const { top, bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [notes, setNotes] = useState('');

  const statusOptions = [
    {
      id: 'on_the_way' as StatusType,
      title: 'Đang di chuyển',
      subtitle: 'Đang trên đường tới điểm cứu trợ',
      icon: 'car',
      color: colors.status.incoming,
      bgColor: `${colors.status.incoming}18`,
    },
    {
      id: 'delivered' as StatusType,
      title: 'Đã giao hàng',
      subtitle: 'Hàng hóa đã được trao tận tay',
      icon: 'checkmark-circle',
      color: colors.status.completed,
      bgColor: `${colors.status.completed}18`,
    },
    {
      id: 'failed' as StatusType,
      title: 'Thất bại / Bị chặn',
      subtitle: 'Không thể tiếp cận địa điểm',
      icon: 'ban',
      color: colors.status.pending,
      bgColor: `${colors.status.pending}18`,
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
        className="flex-row items-center justify-between border-b px-4 pb-2"
      >
        <TouchableOpacity
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center text-lg font-bold leading-tight tracking-tight"
          style={{ color: colors.text }}
        >
          Cập nhật tiến độ
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Task Summary Card */}
        <View className="p-4">
          <View
            className="flex-row items-stretch justify-between gap-4 rounded-xl border p-4 shadow-sm"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View className="flex-[2] flex-col justify-center gap-1">
              <View className="mb-1 inline-flex items-center gap-2">
                <View
                  className="rounded px-2 py-0.5"
                  style={{ backgroundColor: `${colors.status.incoming}18` }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.status.incoming }}
                  >
                    ƯU TIÊN CAO
                  </Text>
                </View>
              </View>
              <Text
                className="text-base font-bold leading-tight"
                style={{ color: colors.text }}
              >
                #RELIEF-204
              </Text>
              <Text
                className="text-sm font-normal leading-normal"
                style={{ color: colors.textSecondary }}
              >
                Nguyễn Văn A - Xã Lộc Yên
              </Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons
                  name="location"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Cách đây 2.5km
                </Text>
              </View>
            </View>
            <View
              className="h-24 w-24 flex-none items-center justify-center rounded-lg border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="map" size={40} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View>
          <Text
            className="px-4 pb-3 pt-2 text-left text-lg font-bold leading-tight tracking-tight"
            style={{ color: colors.text }}
          >
            Trạng thái hiện tại
          </Text>
          <View className="flex-col gap-3 px-4">
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedStatus(option.id)}
                className="relative flex-row items-center gap-4 rounded-xl border p-4"
                style={{
                  backgroundColor: colors.card,
                  borderColor:
                    selectedStatus === option.id
                      ? colors.primary
                      : colors.border,
                }}
              >
                <View
                  className="h-5 w-5 rounded-full border-2"
                  style={{
                    borderColor:
                      selectedStatus === option.id
                        ? colors.primary
                        : colors.border,
                  }}
                >
                  {selectedStatus === option.id && (
                    <View
                      className="h-full w-full items-center justify-center rounded-full"
                      style={{
                        backgroundColor: option.color,
                      }}
                    >
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: colors.white }}
                      />
                    </View>
                  )}
                </View>
                <View
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: option.bgColor }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={option.color}
                  />
                </View>
                <View className="flex grow flex-col">
                  <Text
                    className="text-sm font-bold leading-normal"
                    style={{ color: colors.text }}
                  >
                    {option.title}
                  </Text>
                  <Text
                    className="text-xs font-normal leading-normal"
                    style={{ color: colors.textSecondary }}
                  >
                    {option.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Evidence Section */}
        <View>
          <Text
            className="px-4 pb-3 pt-6 text-left text-lg font-bold leading-tight tracking-tight"
            style={{ color: colors.text }}
          >
            Hình ảnh chứng thực
          </Text>
          <View className="px-4">
            <View className="flex-row gap-3 pb-2">
              {/* Upload Button */}
              <TouchableOpacity
                className="h-28 w-28 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="camera" size={30} color={colors.primary} />
                <Text
                  className="mt-1 text-xs font-medium"
                  style={{ color: colors.primary }}
                >
                  Thêm ảnh
                </Text>
              </TouchableOpacity>
              {/* Preview Image */}
              <View
                className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="h-full w-full items-center justify-center">
                  <Ionicons
                    name="image"
                    size={40}
                    color={colors.textSecondary}
                  />
                </View>
                <TouchableOpacity className="absolute right-1 top-1 rounded-full bg-black/50 p-1">
                  <Ionicons name="close" size={12} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View className="mb-4">
          <Text
            className="px-4 pb-3 pt-4 text-left text-lg font-bold leading-tight tracking-tight"
            style={{ color: colors.text }}
          >
            Ghi chú
          </Text>
          <View className="px-4">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Nhập tình trạng đường đi, lý do thất bại hoặc ghi chú thêm (tùy chọn)..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="min-h-[120px] w-full rounded-xl border p-4 text-sm"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
          </View>
        </View>

        {/* Extra spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Sticky Footer */}
      <View
        style={{
          paddingBottom: bottom + 16,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t p-4 shadow-lg"
      >
        <TouchableOpacity className="flex w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 shadow-lg shadow-primary/30">
          <Text className="text-base font-bold tracking-tight text-white">
            Cập nhật trạng thái
          </Text>
          <Ionicons name="send" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
