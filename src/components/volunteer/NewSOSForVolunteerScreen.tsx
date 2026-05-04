import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  useCampaignHouseholds,
  useReportNewReliefHousehold,
} from '@/src/hooks/useReliefDistribution';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import { getCurrentLocation } from '@/src/utils/location';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EmergencyType = 'medical' | 'supply' | 'isolated';

interface NewSOSForVolunteerScreenProps {
  onBack?: () => void;
  defaultType?: string;
  isEmergencyDefault?: boolean;
}

type LocationCandidate = {
  locationId?: string | null;
  address?: string;
};

const ISSUE_OPTIONS: {
  id: EmergencyType;
  icon: string;
  label: string;
  hint: string;
  tint: string;
  bg: string;
}[] = [
  {
    id: 'medical',
    icon: 'medical',
    label: 'Y tế khẩn cấp',
    hint: 'Cần thuốc men hoặc chăm sóc sức khỏe.',
    tint: '#dc2626',
    bg: '#fee2e2',
  },
  {
    id: 'supply',
    icon: 'cube',
    label: 'Thiếu nhu yếu phẩm',
    hint: 'Cần nước uống, lương thực hoặc gói hỗ trợ.',
    tint: '#0f766e',
    bg: '#ccfbf1',
  },
  {
    id: 'isolated',
    icon: 'boat',
    label: 'Bị cô lập',
    hint: 'Khó tiếp cận, có thể cần xuồng hoặc người dẫn đường.',
    tint: '#334155',
    bg: '#e2e8f0',
  },
];

const makeHouseholdCode = () => `SOS-${Date.now().toString().slice(-8)}`;

const normalize = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

function resolveLocationIdFromAddress(
  address: string,
  candidates: LocationCandidate[],
): string | undefined {
  const normalizedAddress = normalize(address);
  if (!normalizedAddress) return undefined;

  const matched = candidates.find((candidate) => {
    const candidateAddress = normalize(candidate.address);
    return (
      candidateAddress.length > 0 &&
      (normalizedAddress.includes(candidateAddress) ||
        candidateAddress.includes(normalizedAddress))
    );
  });

  return matched?.locationId || undefined;
}

export default function NewSOSForVolunteerScreen({
  onBack,
  defaultType,
  isEmergencyDefault,
}: NewSOSForVolunteerScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: myTeamData } = useMyTeam();
  const team = myTeamData?.team;
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(
    team?.teamId ?? '',
    !!team?.teamId,
  );
  const { selectedCampaignId } = useSelectedCampaign(
    team,
    fallbackAssignedCampaigns,
  );
  const { campaignId } = useActiveAssignedCampaign(
    team,
    selectedCampaignId,
    fallbackAssignedCampaigns,
  );
  const reportNewHouseholdMutation = useReportNewReliefHousehold();
  const { data: nearbyHouseholdsData } = useCampaignHouseholds(
    campaignId || null,
    {
      pageIndex: 1,
      pageSize: 200,
    },
  );

  const [selectedType, setSelectedType] = useState<EmergencyType>(
    (defaultType as EmergencyType) || 'medical',
  );
  const [headOfHouseholdName, setHeadOfHouseholdName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [gpsAddress, setGpsAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<string | undefined>();
  const [isResolvingLocation, setIsResolvingLocation] = useState(true);

  useEffect(() => {
    if (
      defaultType === 'medical' ||
      defaultType === 'supply' ||
      defaultType === 'isolated'
    ) {
      setSelectedType(defaultType);
      return;
    }

    if (isEmergencyDefault) {
      setSelectedType('medical');
    }
  }, [defaultType, isEmergencyDefault]);

  const locationCandidates = useMemo<LocationCandidate[]>(
    () =>
      (nearbyHouseholdsData?.items ?? []).map((item) => ({
        locationId: item.locationId,
        address: item.address,
      })),
    [nearbyHouseholdsData?.items],
  );

  useEffect(() => {
    let mounted = true;

    const resolveGps = async () => {
      try {
        setIsResolvingLocation(true);
        const current = await getCurrentLocation();
        if (!mounted) return;

        setLatitude(current.latitude);
        setLongitude(current.longitude);
        const detectedAddress =
          current.address || current.displayLabel || 'Chưa xác định được vị trí';
        setGpsAddress(detectedAddress);
        setLocationId(resolveLocationIdFromAddress(detectedAddress, locationCandidates));
      } catch (error: any) {
        if (!mounted) return;
        setGpsAddress('Không xác định được vị trí hiện tại');
        showErrorToast('Không lấy được vị trí', error?.message);
      } finally {
        if (mounted) setIsResolvingLocation(false);
      }
    };

    void resolveGps();

    return () => {
      mounted = false;
    };
  }, [locationCandidates]);

  const selectedIssue = ISSUE_OPTIONS.find((item) => item.id === selectedType);

  const handleSubmit = async () => {
    if (!campaignId) {
      showErrorToast(
        'Thiếu chiến dịch',
        'Không xác định được chiến dịch cứu trợ hiện tại.',
      );
      return;
    }

    if (!headOfHouseholdName.trim()) {
      showErrorToast(
        'Thiếu tên chủ hộ',
        'Vui lòng nhập tên chủ hộ hoặc người cần hỗ trợ.',
      );
      return;
    }

    if (!householdSize.trim()) {
      showErrorToast(
        'Thiếu số người trong hộ',
        'Vui lòng nhập số người trong hộ.',
      );
      return;
    }

    if (latitude == null || longitude == null) {
      showErrorToast(
        'Thiếu vị trí',
        'Không lấy được vị trí hiện tại. Vui lòng thử lại khi GPS ổn định.',
      );
      return;
    }

    try {
      await reportNewHouseholdMutation.mutateAsync({
        campaignId,
        request: {
          householdCode: makeHouseholdCode(),
          headOfHouseholdName: headOfHouseholdName.trim(),
          contactPhone: contactPhone.trim() || undefined,
          address: gpsAddress || undefined,
          latitude,
          longitude,
          locationId,
          householdSize: Math.max(
            1,
            Number.parseInt(householdSize || '1', 10) || 1,
          ),
          isIsolated: selectedType === 'isolated',
          requiresBoat: selectedType === 'isolated',
          requiresLocalGuide: selectedType === 'isolated',
          floodSeverityLevel: selectedType === 'isolated' ? 7 : undefined,
          isolationSeverityLevel: selectedType === 'isolated' ? 7 : undefined,
          notes: [
            'Nguồn báo: Tình nguyện viên',
            `Loại phát sinh: ${selectedIssue?.label || 'Cần cứu trợ mới'}`,
          ].join(' | '),
        },
      });

      showSuccessToast('Đã ghi nhận hộ dân mới cần cứu trợ');
      router.back();
    } catch (error: any) {
      showErrorToast('Gửi thông tin thất bại', error?.message);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Báo hộ dân cần cứu trợ mới" onBack={onBack} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + 28 }}
      >
        <View className="gap-5 px-5 pt-4">
          <View
            className="rounded-[28px] border p-5"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Ghi nhận hộ dân mới cần cứu trợ
            </Text>
            <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
              Chỉ cần nhập tên chủ hộ và số người trong hộ. Hệ thống sẽ tự lấy vị trí hiện tại cho bạn.
            </Text>
          </View>

          <View
            className="rounded-[28px] border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              Loại hỗ trợ cần ưu tiên
            </Text>
            <View className="mt-3 flex-row gap-3">
              {ISSUE_OPTIONS.map((item) => {
                const active = selectedType === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedType(item.id)}
                    className="flex-1 rounded-2xl border p-3"
                    style={{
                      borderColor: active ? item.tint : colors.border,
                      backgroundColor: active ? `${item.tint}14` : colors.card,
                    }}
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: item.bg }}
                    >
                      <Ionicons name={item.icon as any} size={18} color={item.tint} />
                    </View>
                    <Text className="mt-3 text-sm font-bold" style={{ color: colors.text }}>
                      {item.label}
                    </Text>
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                      {item.hint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            className="rounded-[28px] border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              Thông tin cơ bản
            </Text>
            <View className="mt-3 gap-3">
              <View>
                <Text className="mb-2 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Tên chủ hộ
                </Text>
                <TextInput
                  value={headOfHouseholdName}
                  onChangeText={setHeadOfHouseholdName}
                  placeholder="Nhập tên chủ hộ hoặc người cần hỗ trợ"
                  placeholderTextColor={colors.textSecondary}
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.background }}
                />
              </View>

              <View>
                <Text className="mb-2 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Số người trong hộ
                </Text>
                <TextInput
                  value={householdSize}
                  onChangeText={setHouseholdSize}
                  placeholder="Ví dụ: 4"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.background }}
                />
              </View>

              <View>
                <Text className="mb-2 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Số điện thoại (không bắt buộc)
                </Text>
                <TextInput
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="Nhập số điện thoại nếu có"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.background }}
                />
              </View>
            </View>
          </View>

          <View
            className="rounded-[28px] border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                Vị trí hiện tại
              </Text>
            </View>

            {isResolvingLocation ? (
              <View className="mt-3 flex-row items-center gap-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Đang lấy GPS và địa chỉ gần đúng...
                </Text>
              </View>
            ) : (
              <>
                <Text className="mt-3 text-sm" style={{ color: colors.text }}>
                  {gpsAddress || 'Không xác định được vị trí hiện tại'}
                </Text>
                <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                  {latitude != null && longitude != null
                    ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                    : 'Tọa độ chưa sẵn sàng'}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={reportNewHouseholdMutation.isPending || isResolvingLocation}
            className="items-center rounded-2xl py-3"
            style={{
              backgroundColor: colors.primary,
              opacity:
                reportNewHouseholdMutation.isPending || isResolvingLocation
                  ? 0.7
                  : 1,
            }}
          >
            {reportNewHouseholdMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Gửi hộ dân cần cứu trợ mới
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
