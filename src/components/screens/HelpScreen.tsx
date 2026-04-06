import '@/global.css';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HelpScreenProps {
  onBack?: () => void;
}

interface HelpStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const USER_STEPS: HelpStep[] = [
  {
    icon: 'log-in-outline',
    title: 'Đăng nhập / Đăng ký',
    description:
      'Tạo tài khoản hoặc đăng nhập bằng email và mật khẩu để bắt đầu sử dụng ứng dụng.',
  },
  {
    icon: 'home-outline',
    title: 'Màn hình chính',
    description:
      'Trang chủ hiển thị thông tin thời tiết, cảnh báo thiên tai, và các yêu cầu cứu trợ gần đây.',
  },
  {
    icon: 'add-circle-outline',
    title: 'Tạo yêu cầu cứu trợ',
    description:
      'Nhấn vào nút "+" ở thanh điều hướng để tạo yêu cầu mới. Điền thông tin vị trí, loại hỗ trợ cần thiết và mô tả tình huống.',
  },
  {
    icon: 'document-text-outline',
    title: 'Theo dõi yêu cầu',
    description:
      'Vào Profile > Theo dõi yêu cầu để xem trạng thái các yêu cầu đã gửi. Bạn sẽ thấy tiến trình từ khi gửi đến khi hoàn thành.',
  },
  {
    icon: 'call-outline',
    title: 'Liên hệ tình nguyện viên',
    description:
      'Khi có tình nguyện viên được phân công, bạn có thể gọi điện hoặc nhắn tin trực tiếp qua ứng dụng.',
  },
  {
    icon: 'warning-outline',
    title: 'SOS Khẩn cấp',
    description:
      'Trong trường hợp khẩn cấp, nhấn nút SOS đỏ để gửi tín hiệu khẩn cấp. Hệ thống sẽ ưu tiên xử lý yêu cầu của bạn.',
  },
];

const VOLUNTEER_STEPS: HelpStep[] = [
  {
    icon: 'log-in-outline',
    title: 'Đăng nhập tài khoản TNV',
    description:
      'Đăng nhập bằng tài khoản tình nguyện viên đã được đăng ký và phê duyệt.',
  },
  {
    icon: 'home-outline',
    title: 'Trang chủ TNV',
    description:
      'Xem tổng quan nhiệm vụ, thống kê cá nhân và các yêu cầu cứu trợ mới nhất trong khu vực.',
  },
  {
    icon: 'clipboard-outline',
    title: 'Xem nhiệm vụ được giao',
    description:
      'Vào Profile > Theo dõi nhiệm vụ để xem danh sách các nhiệm vụ đang thực hiện, chờ xử lý và đã hoàn thành.',
  },
  {
    icon: 'checkmark-circle-outline',
    title: 'Cập nhật trạng thái',
    description:
      'Nhấn nút "Cập nhật" trên mỗi nhiệm vụ để thay đổi trạng thái: Đang đến → Đã đến → Đang hỗ trợ → Hoàn thành.',
  },
  {
    icon: 'navigate-outline',
    title: 'Điều hướng',
    description:
      'Nhấn vào nhiệm vụ để xem chi tiết và bản đồ. Sử dụng nút điều hướng để mở Google Maps dẫn đường.',
  },
  {
    icon: 'call-outline',
    title: 'Liên hệ người cần hỗ trợ',
    description:
      'Gọi điện hoặc nhắn tin cho người yêu cầu trực tiếp từ màn hình chi tiết nhiệm vụ.',
  },
  {
    icon: 'toggle-outline',
    title: 'Trạng thái sẵn sàng',
    description:
      'Chuyển đổi giữa "Sẵn sàng" và "Bận" để hệ thống biết khi nào bạn có thể nhận nhiệm vụ mới.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Làm thế nào để hủy yêu cầu cứu trợ?',
    answer:
      'Vào Theo dõi yêu cầu > Chọn yêu cầu > Nhấn "Hủy yêu cầu cứu hộ" ở cuối màn hình. Chỉ hủy khi bạn đã an toàn.',
  },
  {
    question: 'Tại sao tôi không nhận được thông báo?',
    answer:
      'Kiểm tra Cài đặt > Thông báo và đảm bảo đã bật "Cho phép thông báo". Cũng kiểm tra cài đặt thông báo của điện thoại.',
  },
  {
    question: 'Làm sao để cập nhật vị trí?',
    answer:
      'Ứng dụng tự động cập nhật vị trí khi bạn tạo yêu cầu mới. Đảm bảo đã cấp quyền vị trí cho ứng dụng.',
  },
  {
    question: 'Tôi có thể thay đổi thông tin cá nhân không?',
    answer:
      'Có, vào Profile > Thông tin cá nhân để cập nhật họ tên, số điện thoại và địa chỉ.',
  },
];

export default function HelpScreen({ onBack }: HelpScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isVolunteer = user?.role === 'Volunteer';
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const steps = isVolunteer ? VOLUNTEER_STEPS : USER_STEPS;

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View
        style={{ paddingTop: top }}
        className="flex-row items-center gap-3 border-b border-gray-100 bg-white px-4 py-4"
      >
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="#111418" />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold">Trợ giúp</Text>
      </View>

      <ScrollView
        style={{ paddingBottom: bottom + 32 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View className="bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-6">
          <View className="mb-3 flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Ionicons name="help-buoy" size={28} color="#fff" />
            </View>
            <View>
              <Text className="text-lg font-bold">
                Xin chào, {user?.user_name}!
              </Text>
              <Text className="text-sm text-text-secondary">
                {isVolunteer
                  ? 'Hướng dẫn sử dụng cho Tình nguyện viên'
                  : 'Hướng dẫn sử dụng cho Người dùng'}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600">
            Dưới đây là các bước hướng dẫn giúp bạn sử dụng ứng dụng một cách
            hiệu quả nhất.
          </Text>
        </View>

        {/* Steps Section */}
        <View className="mt-4 bg-white px-4 py-4">
          <Text className="mb-4 text-base font-bold text-gray-800">
            Các bước sử dụng
          </Text>

          {steps.map((step, index) => (
            <View key={index} className="mb-4 flex-row gap-3">
              {/* Step Number & Line */}
              <View className="items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Text className="text-sm font-bold text-white">
                    {index + 1}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View className="my-1 w-0.5 flex-1 bg-primary/30" />
                )}
              </View>

              {/* Step Content */}
              <View className="flex-1 pb-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <Ionicons name={step.icon} size={18} color="#DA251D" />
                  <Text className="text-base font-bold">{step.title}</Text>
                </View>
                <Text className="text-sm leading-5 text-gray-600">
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ Section */}
        <View className="mt-4 bg-white px-4 py-4">
          <Text className="mb-4 text-base font-bold text-gray-800">
            Câu hỏi thường gặp
          </Text>

          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                setExpandedFaq(expandedFaq === index ? null : index)
              }
              className="border-b border-gray-100 py-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-base font-medium">
                  {item.question}
                </Text>
                <Ionicons
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </View>
              {expandedFaq === index && (
                <Text className="mt-2 text-sm leading-5 text-gray-600">
                  {item.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Support */}
        <View className="mt-4 bg-white px-4 py-4">
          <Text className="mb-4 text-base font-bold text-gray-800">
            Cần hỗ trợ thêm?
          </Text>

          <TouchableOpacity className="mb-3 flex-row items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="mail-outline" size={20} color="#DA251D" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium">Email hỗ trợ</Text>
              <Text className="text-sm text-primary">support@reliefapp.vn</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="call-outline" size={20} color="#DA251D" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium">Hotline</Text>
              <Text className="text-sm text-primary">1900 1234 56</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
