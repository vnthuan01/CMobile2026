import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDonationStatus } from '@/src/hooks/useDonation';
import { useTheme } from '@/src/context/ThemeContext';
import { DonationStatus } from '@/src/services/donationService';

type ResultState =
  | 'checking'
  | 'success'
  | 'cancelled'
  | 'failed'
  | 'expired'
  | 'unknown';

const toSingleParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const mapQueryStatusToState = (status?: string): ResultState => {
  const normalized = (status || '').trim().toLowerCase();

  if (['success', 'completed', 'paid'].includes(normalized)) return 'success';
  if (['cancel', 'cancelled', 'canceled'].includes(normalized)) return 'cancelled';
  if (['failed', 'error'].includes(normalized)) return 'failed';
  if (normalized === 'expired') return 'expired';
  if (['pending', 'checking', 'processing'].includes(normalized)) return 'checking';
  return 'unknown';
};

export default function DonateResultScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const donationId = toSingleParam(params.donationId);
  const campaignId = toSingleParam(params.campaignId);
  const queryStatus = toSingleParam(params.paymentStatus) || toSingleParam(params.status);

  const {
    data: donationStatus,
    isFetching: isFetchingDonationStatus,
    isLoading: isLoadingDonationStatus,
  } = useDonationStatus(donationId, !!donationId);

  const resultState = useMemo<ResultState>(() => {
    if (donationId) {
      const statusValue = Number(donationStatus?.status);

      if (statusValue === DonationStatus.Completed) return 'success';
      if (statusValue === DonationStatus.Cancelled) return 'cancelled';
      if (statusValue === DonationStatus.Failed) return 'failed';
      if (statusValue === DonationStatus.Expired) return 'expired';
      if (
        statusValue === DonationStatus.Pending ||
        isLoadingDonationStatus ||
        isFetchingDonationStatus
      ) {
        return 'checking';
      }

      if (donationStatus) return 'unknown';
    }

    return mapQueryStatusToState(queryStatus);
  }, [
    donationId,
    donationStatus,
    isFetchingDonationStatus,
    isLoadingDonationStatus,
    queryStatus,
  ]);

  const ui = useMemo(() => {
    switch (resultState) {
      case 'checking':
        return {
          icon: 'time-outline' as const,
          color: colors.status.pending,
          title: 'Đang kiểm tra trạng thái thanh toán',
          message:
            'Hệ thống đang xác nhận giao dịch của bạn. Vui lòng chờ trong giây lát hoặc quay lại sau.',
        };
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.status.completed,
          title: 'Thanh toán thành công',
          message: 'Cảm ơn bạn đã đóng góp cho chiến dịch cứu trợ của ReliefCare.',
        };
      case 'cancelled':
        return {
          icon: 'close-circle' as const,
          color: colors.status.cancelled,
          title: 'Bạn đã hủy thanh toán',
          message: 'Giao dịch chưa được hoàn tất. Bạn có thể quay lại để ủng hộ bất cứ lúc nào.',
        };
      case 'failed':
        return {
          icon: 'close-circle' as const,
          color: colors.status.error,
          title: 'Thanh toán thất bại',
          message: 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại.',
        };
      case 'expired':
        return {
          icon: 'hourglass-outline' as const,
          color: colors.textSecondary,
          title: 'Liên kết thanh toán đã hết hạn',
          message: 'Vui lòng tạo lại giao dịch mới để tiếp tục ủng hộ.',
        };
      default:
        return {
          icon: 'help-circle-outline' as const,
          color: colors.textSecondary,
          title: 'Không xác định được kết quả',
          message:
            'Chúng tôi chưa nhận được trạng thái rõ ràng từ cổng thanh toán. Vui lòng kiểm tra lại trong mục ủng hộ.',
        };
    }
  }, [colors.status.cancelled, colors.status.completed, colors.status.error, colors.status.pending, colors.textSecondary, resultState]);

  const showLoading =
    !!donationId &&
    resultState === 'checking' &&
    (isLoadingDonationStatus || isFetchingDonationStatus);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: top + 24 }}>
      <View className="flex-1 justify-center p-6" style={{ paddingBottom: Math.max(bottom, 24) }}>
        <View className="rounded-2xl border p-6" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
          <View className="items-center">
            {showLoading ? (
              <ActivityIndicator size="large" color={colors.status.pending} />
            ) : (
              <Ionicons name={ui.icon} size={72} color={ui.color} />
            )}

            <Text className="mt-4 text-center text-xl font-bold" style={{ color: colors.text }}>
              {ui.title}
            </Text>

            <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
              {ui.message}
            </Text>

            {donationId ? (
              <Text className="mt-3 text-center text-xs" style={{ color: colors.textSecondary }}>
                Mã giao dịch ủng hộ: {donationId}
              </Text>
            ) : null}
          </View>

          <View className="mt-6 gap-3">
            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/donate',
                  params: {
                    refresh: '1',
                    ...(campaignId ? { campaignId } : {}),
                  },
                })
              }
              className="h-12 items-center justify-center rounded-lg bg-primary"
            >
              <Text className="font-bold text-white">Quay lại ủng hộ</Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/(tabs)')}
              className="h-12 items-center justify-center rounded-lg border"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <Text className="font-semibold" style={{ color: colors.text }}>
                Về trang chủ
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
