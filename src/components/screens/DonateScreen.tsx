import { useTheme } from '@/src/context/ThemeContext';
import {
  donationKeys,
  useCampaignDonationSummary,
  useCreateDonationCheckout,
  useDonationStatus,
  useFundContributions,
  useFundraisingCampaigns,
} from '@/src/hooks/useDonation';
import {
  CampaignResourceType,
  CampaignType,
  DonationStatus,
} from '@/src/services/donationService';
import { useAuthStore } from '@/src/store/authStore';
import { showApiErrorToast } from '@/src/utils/apiToast';
import { getScreenScaleConfig } from '@/src/utils/responsive';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DonateScreenProps {
  onBack?: () => void;
}

const DONATION_AMOUNTS = [
  '50.000',
  '100.000',
  '200.000',
  '500.000',
  '1.000.000',
  '2.000.000',
  '5.000.000',
  '10.000.000',
  '20.000.000',
  '50.000.000',
  '100.000.000',
  '200.000.000',
  '500.000.000',
];

// format 500000 -> 500.000
const formatCurrency = (value: string | number) => {
  const number =
    typeof value === 'number'
      ? value
      : parseInt(value.replace(/\D/g, '') || '0', 10);

  return number.toLocaleString('vi-VN');
};

// parse 500.000 -> 500000 (để gửi API)
const parseCurrency = (value: string) => {
  return parseInt(value.replace(/\D/g, '') || '0', 10);
};

const DONATION_STATUS_UI: Record<
  number,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  [DonationStatus.Pending]: {
    label: 'Đang chờ thanh toán',
    color: '#f59e0b',
    icon: 'time-outline',
  },
  [DonationStatus.Completed]: {
    label: 'Thanh toán thành công',
    color: '#10b981',
    icon: 'checkmark-circle-outline',
  },
  [DonationStatus.Failed]: {
    label: 'Thanh toán thất bại',
    color: '#ef4444',
    icon: 'close-circle-outline',
  },
  [DonationStatus.Cancelled]: {
    label: 'Đã hủy',
    color: '#ef4444',
    icon: 'close-circle-outline',
  },
  [DonationStatus.Expired]: {
    label: 'Liên kết đã hết hạn',
    color: '#64748b',
    icon: 'hourglass-outline',
  },
  [DonationStatus.Refunded]: {
    label: 'Đã hoàn tiền',
    color: '#8b5cf6',
    icon: 'reload-circle-outline',
  },
};

const Touchable = TouchableOpacity as any;

export default function DonateScreen({ onBack }: DonateScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const campaignIdParam = Array.isArray(params.campaignId)
    ? params.campaignId[0]
    : params.campaignId;
  const refreshParam = Array.isArray(params.refresh)
    ? params.refresh[0]
    : params.refresh;
  const shouldRefresh = refreshParam === '1';
  const hasHandledRefresh = useRef(false);
  const { top, bottom } = useSafeAreaInsets();
  const { width, height, fontScale } = useWindowDimensions();
  const screenScale = getScreenScaleConfig(width, height, fontScale);
  const { colors } = useTheme();
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [selectedAmount, setSelectedAmount] = useState('500000');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [message, setMessage] = useState('');
  const [donationId, setDonationId] = useState<string | null>(null);
  const donorName = useMemo(() => {
    if (isLoggedIn) {
      return (
        user?.user_name?.trim() ||
        user?.email?.trim() ||
        'Người ủng hộ ReliefHub'
      );
    }
    return guestName.trim();
  }, [guestName, isLoggedIn, user?.email, user?.user_name]);

  const {
    data: fundraisingCampaigns,
    isLoading: isLoadingFundraisingCampaigns,
  } = useFundraisingCampaigns();
  const { data: fundContributions, isLoading: isLoadingFundContributions } =
    useFundContributions();
  const activeFundraisingCampaignId =
    typeof campaignIdParam === 'string' && campaignIdParam.trim().length > 0
      ? campaignIdParam
      : fundraisingCampaigns?.items?.[0]?.campaignId;
  const { data: campaignSummary, isLoading: isLoadingCampaignSummary } =
    useCampaignDonationSummary(activeFundraisingCampaignId);
  const { mutateAsync: createCheckout, isPending: isCreatingCheckout } =
    useCreateDonationCheckout();
  const { data: donationStatus, isFetching: isPollingDonationStatus } =
    useDonationStatus(donationId || undefined, !!donationId);

  const moneyGoal = useMemo(
    () =>
      campaignSummary?.goals?.find(
        (goal: any) => Number(goal.resourceType) === CampaignResourceType.Money,
      ),
    [campaignSummary],
  );

  const topDonors = useMemo(() => {
    const palette = ['#4F46E5', '#E11D48', '#0EA5E9', '#16A34A', '#F59E0B'];

    return (fundContributions || [])
      .filter(
        (item: any) =>
          !campaignSummary?.campaignId ||
          item.campaignId === campaignSummary.campaignId,
      )
      .slice(0, 5)
      .map((donor: any, index: number) => {
        const donorNameText = donor.donorName || 'Người ủng hộ';
        const parts = donorNameText.split(' ').filter(Boolean);
        const initials =
          parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : donorNameText.slice(0, 2).toUpperCase();

        return {
          name: donorNameText,
          time: donor.createdAt
            ? new Date(donor.createdAt).toLocaleString('vi-VN')
            : 'Vừa xong',
          amount: `+ ${formatCurrency(donor.amount || 0)}đ`,
          initials,
          gradientEnd: palette[index % palette.length],
        };
      });
  }, [campaignSummary?.campaignId, fundContributions]);

  const donationStatusUi =
    DONATION_STATUS_UI[
      Number(donationStatus?.status ?? DonationStatus.Pending)
    ];

  useEffect(() => {
    if (!shouldRefresh || hasHandledRefresh.current) return;

    hasHandledRefresh.current = true;

    const refreshDonationData = async () => {
      try {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: donationKeys.fundraisingCampaigns,
          }),
          queryClient.invalidateQueries({
            queryKey: donationKeys.contributions,
          }),
          ...(activeFundraisingCampaignId
            ? [
                queryClient.invalidateQueries({
                  queryKey: donationKeys.campaignSummary(
                    activeFundraisingCampaignId,
                  ),
                }),
              ]
            : []),
        ]);
      } finally {
        router.replace({
          pathname: '/donate',
          params: campaignIdParam ? { campaignId: campaignIdParam } : {},
        });
      }
    };

    void refreshDonationData();
  }, [
    activeFundraisingCampaignId,
    campaignIdParam,
    queryClient,
    router,
    shouldRefresh,
  ]);

  useEffect(() => {
    if (!donationStatus) return;

    if (Number(donationStatus.status) === DonationStatus.Completed) {
      showSuccessToast(
        'Ủng hộ thành công',
        'Cảm ơn bạn đã đóng góp cho chiến dịch.',
      );
      setDonationId(null);
      return;
    }

    if (Number(donationStatus.status) === DonationStatus.Failed) {
      showErrorToast(
        'Thanh toán thất bại',
        'Giao dịch chưa hoàn tất. Vui lòng thử lại.',
      );
      setDonationId(null);
      return;
    }

    if (Number(donationStatus.status) === DonationStatus.Cancelled) {
      showInfoToast(
        'Bạn đã hủy thanh toán',
        'Bạn có thể tạo lại checkout khi sẵn sàng.',
      );
      setDonationId(null);
      return;
    }

    if (Number(donationStatus.status) === DonationStatus.Expired) {
      showErrorToast(
        'Liên kết đã hết hạn',
        'Vui lòng tạo lại checkout mới để tiếp tục ủng hộ.',
      );
      setDonationId(null);
    }
  }, [donationStatus]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.replace('/login');
    }
  };
  const handleDonate = async () => {
    const normalizedAmount = parseCurrency(selectedAmount);

    if (!campaignSummary?.campaignId) {
      showErrorToast(
        'Chưa có chiến dịch gây quỹ',
        'Không tìm thấy chiến dịch gây quỹ để tạo thanh toán.',
      );
      return;
    }

    if (Number(campaignSummary.type) !== CampaignType.Fundraising) {
      showErrorToast(
        'Chiến dịch không hợp lệ',
        'Chiến dịch hiện tại không phải chiến dịch gây quỹ.',
      );
      return;
    }

    if (normalizedAmount < 1000) {
      showErrorToast('Số tiền không hợp lệ', 'Số tiền tối thiểu là 1.000đ.');
      return;
    }

    if (!isLoggedIn && !guestName.trim()) {
      showErrorToast(
        'Thiếu họ và tên',
        'Vui lòng nhập họ và tên trước khi thanh toán.',
      );
      return;
    }

    if (!isLoggedIn && !guestPhone.trim()) {
      showErrorToast(
        'Thiếu số điện thoại',
        'Vui lòng nhập số điện thoại trước khi thanh toán.',
      );
      return;
    }

    try {
      const encodedCampaignId = encodeURIComponent(campaignSummary.campaignId);
      const returnUrl = `reliefcare://donate-result?paymentStatus=success&campaignId=${encodedCampaignId}`;
      const cancelUrl = `reliefcare://donate-result?paymentStatus=cancelled&campaignId=${encodedCampaignId}`;

      const checkout = await createCheckout({
        campaignId: campaignSummary.campaignId,
        amount: normalizedAmount,
        donorName,
        message: message.trim() || undefined,
        returnUrl,
        cancelUrl,
      });

      setDonationId(checkout.donationId);

      if (checkout.checkoutUrl) {
        await WebBrowser.openBrowserAsync(checkout.checkoutUrl);
        showInfoToast(
          'Đã mở trang thanh toán',
          'Ứng dụng sẽ tự kiểm tra trạng thái ủng hộ sau khi bạn quay lại.',
        );
      }
    } catch (error) {
      const extractedMessage = String(
        (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          '',
      );
      if (extractedMessage.includes('502')) {
        showErrorToast(
          'Lỗi cổng thanh toán',
          'Máy chủ đang phản hồi lỗi 502 khi tạo thanh toán PayOS. Vui lòng kiểm tra cấu hình cổng thanh toán ở hệ thống máy chủ.',
        );
        return;
      }
      showApiErrorToast(error, {
        errorTitle: 'Không thể tạo thanh toán',
        errorMessage: 'Không thể khởi tạo thanh toán ủng hộ.',
      });
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top,
          borderColor: colors.border,
          backgroundColor: colors.card,
          paddingHorizontal: screenScale.horizontalPadding,
        }}
        className="mb-2 flex-row items-center border-b py-3 pb-2"
      >
        <Touchable
          onPress={handleBack}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Touchable>

        <View className="flex-1 items-center justify-center">
          <Text
            className="text-center text-lg font-bold"
            style={{ color: colors.text }}
          >
            Ủng hộ Cứu trợ
          </Text>
        </View>

        <View className="h-12 w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottom + 120 }} // Extra padding for sticky footer
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mx-auto w-full flex-col gap-6"
          style={{
            maxWidth: screenScale.contentMaxWidth,
            paddingHorizontal: screenScale.horizontalPadding,
            paddingVertical: 16,
          }}
        >
          {/* Campaign Card */}
          <View
            className="rounded-xl border p-4 shadow-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <View className="flex-row gap-4">
              <ImageBackground
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApbKZEYD_SSsqpyGP99rTgYz22de_Tg22sK6zWwu7H0h5O3gOCJvV4YC5TE3JXggqAIl_xx2o5wdshUUUNAW0A2BhWADtvvDN3hnh0MbE7ka4e__MugwvEOFG6OPs4c5jr-MGs2RjSK6-IpbaWrJEuW1SHaPrhVH78etwwQLjH7pHoPBK3pkssqij1zKDkB4FqtkzLFuspbPLVnchXwyYrQIzgF-6GK1kPqUlb1MQBtmw8GLq4OqWwZ7F4AwzYxjD-fip7aZzXWgc',
                }}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg"
                style={{ backgroundColor: colors.surface }}
                imageStyle={{ resizeMode: 'cover' }}
              />
              <View className="flex-1 flex-col justify-between py-1">
                <View>
                  <View className="mb-1 flex-row flex-wrap items-center gap-1">
                    <View className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5">
                      <Text className="text-xs font-bold text-primary">
                        {campaignSummary &&
                        Number(campaignSummary.type) ===
                          CampaignType.Fundraising
                          ? 'Gây quỹ'
                          : 'Chiến dịch'}
                      </Text>
                    </View>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={colors.status.completed}
                    />
                    {donationId && donationStatusUi ? (
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{
                          backgroundColor: `${donationStatusUi.color}20`,
                        }}
                      >
                        <Text
                          className="text-[11px] font-bold"
                          style={{ color: donationStatusUi.color }}
                        >
                          {donationStatusUi.label}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className="text-base font-bold leading-tight"
                    style={{ color: colors.text }}
                  >
                    {isLoadingCampaignSummary || isLoadingFundraisingCampaigns
                      ? 'Đang tải chiến dịch gây quỹ...'
                      : campaignSummary?.name || 'Chiến dịch gây quỹ cứu trợ'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="people"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {campaignSummary
                      ? `${campaignSummary.procurementOrderCount || 0} giao dịch/quy trình liên quan quỹ`
                      : 'Đang tải dữ liệu quyên góp'}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mt-4 flex-col gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm font-bold text-primary">
                  {campaignSummary
                    ? `${formatCurrency(campaignSummary.totalMoneyReceived || 0)} VND`
                    : '--'}
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Mục tiêu:{' '}
                  {moneyGoal?.targetAmount
                    ? `${formatCurrency(moneyGoal.targetAmount)} VND`
                    : 'Chưa cập nhật'}
                </Text>
              </View>
              <View
                className="h-2.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: colors.surface }}
              >
                <View
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${Math.max(0, Math.min(Number(moneyGoal?.progressPercent || 0), 100))}%`,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Donation Amount */}
          <View>
            <Text
              className="mb-3 px-1 text-lg font-bold"
              style={{ color: colors.text }}
            >
              Số tiền ủng hộ
            </Text>
            <View className="relative mb-4">
              <View className="pointer-events-none absolute bottom-0 left-4 top-0 z-10 flex items-center justify-center">
                <Text
                  className="font-bold"
                  style={{ color: colors.textSecondary }}
                >
                  VND
                </Text>
              </View>
              <TextInput
                className="w-full rounded-xl border-2 border-primary py-4 pl-16 pr-4 text-2xl font-bold"
                style={{ backgroundColor: colors.card, color: colors.text }}
                placeholder="0"
                keyboardType="numeric"
                value={formatCurrency(selectedAmount)}
                onChangeText={(text: string) => {
                  const raw = parseCurrency(text);
                  setSelectedAmount(raw.toString());
                }}
              />
            </View>
            <View className="mb-2">
              <Text
                className="mb-2 px-1 text-lg font-bold"
                style={{ color: colors.text }}
              >
                Thao tác chọn nhanh:
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2 pb-2"
              >
                {DONATION_AMOUNTS.map((amount) => {
                  const amountValue = parseCurrency(amount).toString();
                  const isActive = selectedAmount === amountValue;

                  return (
                    <Touchable
                      key={amount}
                      accessibilityLabel={amount}
                      onPress={() => setSelectedAmount(amountValue)}
                      className="mr-2 shrink-0 rounded-lg px-4 py-2"
                      style={{
                        borderWidth: 1,
                        minWidth: Math.max(
                          84,
                          Math.round(84 * screenScale.scale),
                        ),
                        borderColor: isActive ? colors.accent : colors.border,
                        backgroundColor: isActive
                          ? `${colors.accent}22`
                          : colors.card,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{
                          textAlign: 'center',
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? colors.accent : colors.text,
                        }}
                      >
                        {amount}
                      </Text>
                    </Touchable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Donor info + message */}
          <View className="flex-col gap-4">
            <View>
              <Text
                className="mb-2 text-sm font-medium"
                style={{ color: colors.text }}
              >
                Thông tin người ủng hộ
              </Text>
              {isLoggedIn ? (
                <View
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Đang dùng thông tin từ tài khoản đăng nhập
                  </Text>
                  <Text
                    className="mt-2 text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Họ và tên: {user?.user_name?.trim() || 'Chưa cập nhật'}
                  </Text>
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Email: {user?.email?.trim() || 'Chưa cập nhật'}
                  </Text>
                </View>
              ) : (
                <View
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Text
                    className="mb-2 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Vui lòng nhập thông tin trước khi tạo thanh toán.
                  </Text>
                  <TextInput
                    className="mb-3 w-full rounded-xl border p-3 text-sm"
                    placeholder="Họ và tên"
                    placeholderTextColor={colors.textSecondary}
                    value={guestName}
                    onChangeText={setGuestName}
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text,
                    }}
                  />
                  <TextInput
                    className="w-full rounded-xl border p-3 text-sm"
                    placeholder="Số điện thoại"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text,
                    }}
                  />
                </View>
              )}
              <Text
                className="mt-2 text-xs"
                style={{ color: colors.textSecondary }}
              >
                Một số thông tin thanh toán có thể được yêu cầu bổ sung trên
                trang PayOS.
              </Text>
            </View>
            <View className="relative">
              <Text
                className="mb-2 text-sm font-medium"
                style={{ color: colors.text }}
              >
                Lời nhắn (Tùy chọn)
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                className="min-h-[100px] w-full rounded-xl border p-4 text-sm"
                placeholder="Gửi những lời động viên chân thành nhất đến bà con..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                style={{
                  textAlignVertical: 'top',
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />
            </View>
          </View>

          {/* Payment Method */}
          <View>
            <Text
              className="mb-3 px-1 text-lg font-bold"
              style={{ color: colors.text }}
            >
              Phương thức thanh toán
            </Text>
            <View
              className="rounded-xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `${colors.primary}14` }}
                >
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    Thanh toán qua PayOS
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Bạn sẽ được chuyển đến trang thanh toán PayOS để chọn ngân
                    hàng hoặc quét QR.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Nhà hảo tâm nổi bật */}
          <View
            className="border-t pt-4"
            style={{ borderColor: colors.border }}
          >
            <View className="mb-4 flex-row items-center justify-between px-1">
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Nhà hảo tâm hàng đầu
              </Text>
              <Touchable className="flex-row items-center gap-1">
                <Text className="text-sm font-medium text-primary">
                  Xem tất cả
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  className="text-primary"
                  color="currentColor"
                />
              </Touchable>
            </View>
            <View className="flex-col gap-4">
              {isLoadingFundContributions ? (
                <View className="items-center justify-center py-6">
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text
                    className="mt-2 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Đang tải nhà hảo tâm...
                  </Text>
                </View>
              ) : topDonors.length === 0 ? (
                <View
                  className="rounded-xl border border-dashed px-4 py-5"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Text
                    className="text-center text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Chưa có nhà hảo tâm hiển thị
                  </Text>
                  <Text
                    className="mt-1 text-center text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Khi có giao dịch ủng hộ thành công, danh sách nhà hảo tâm sẽ
                    được cập nhật tự động.
                  </Text>
                </View>
              ) : (
                topDonors.map((donor: any, index: number) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Avatar Gradient Placeholder in React Native - using a simple view with background color for simplicity instead of complex gradients */}
                      <View
                        className="flex h-10 w-10 items-center justify-center rounded-full shadow-md"
                        style={{ backgroundColor: donor.gradientEnd }}
                      >
                        <Text className="text-sm font-bold text-white">
                          {donor.initials}
                        </Text>
                      </View>
                      <View className="flex-col">
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          {donor.name}
                        </Text>
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {donor.time}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm font-bold text-primary">
                      {donor.amount}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t p-4"
        style={{
          paddingBottom: Math.max(bottom, 16),
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <View className="mx-auto w-full max-w-md flex-col gap-2">
          <View className="flex-row items-center justify-between px-1">
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="lock-closed"
                size={14}
                color={colors.textSecondary}
              />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Thanh toán an toàn
              </Text>
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Điều khoản & Chính sách
            </Text>
          </View>
          <Pressable
            onPress={() => void handleDonate()}
            disabled={
              isCreatingCheckout ||
              isLoadingCampaignSummary ||
              isLoadingFundraisingCampaigns ||
              !campaignSummary?.campaignId
            }
            className="flex h-12 w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary"
            style={({ pressed }) => ({
              opacity:
                isCreatingCheckout ||
                isLoadingCampaignSummary ||
                isLoadingFundraisingCampaigns ||
                !campaignSummary?.campaignId
                  ? 0.7
                  : pressed
                    ? 0.92
                    : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            {isCreatingCheckout || isPollingDonationStatus ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text className="font-bold text-white">
                  Ủng hộ {formatCurrency(selectedAmount)}đ
                </Text>
                <Ionicons name="heart" size={20} color={colors.white} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
