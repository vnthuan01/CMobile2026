import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import { useFundraisingCampaigns } from '@/src/hooks/useDonation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FundraisingCampaignListScreen() {
  const Touchable = TouchableOpacity as any;
  const Press = Pressable as any;
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch } = useFundraisingCampaigns();

  const campaigns = data?.items || [];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: top,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
        className="mb-2 flex-row items-center justify-between border-b px-4 py-3 pb-2"
      >
        <Touchable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Touchable>

        <Text
          className="flex-1 pr-12 text-center text-lg font-bold"
          style={{ color: colors.text }}
        >
          Chiến dịch gây quỹ
        </Text>

        <View className="h-12 w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-md gap-4 p-4">
          <View
            className="rounded-2xl border px-4 py-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-xl font-black" style={{ color: colors.text }}>
              Chọn Chiến dịch để ủng hộ
            </Text>
            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: colors.textSecondary }}
            >
              Ứng dụng sẽ lấy danh sách Chiến dịch gây quỹ đang Hoạt động, sau
              đó bạn chọn Chiến dịch gây quỹ cụ thể rồi mới vào màn Ủng hộ.
            </Text>
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                className="mt-3 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Đang tải danh sách Chiến dịch gây quỹ...
              </Text>
            </View>
          ) : isError ? (
            <View
              className="items-center rounded-2xl border border-dashed px-5 py-10"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={42}
                color={colors.status.error}
              />
              <Text
                className="mt-3 text-lg font-bold"
                style={{ color: colors.text }}
              >
                Không tải được danh sách Chiến dịch gây quỹ
              </Text>
              <Text
                className="mt-2 text-center text-sm"
                style={{ color: colors.textSecondary }}
              >
                Vui lòng thử lại để lấy Chiến dịch gây quỹ đang mở quyên góp.
              </Text>
              <Touchable
                onPress={() => void refetch()}
                className="mt-4 rounded-xl px-4 py-3"
                style={{ backgroundColor: `${colors.primary}18` }}
              >
                <Text className="font-bold" style={{ color: colors.primary }}>
                  Thử lại
                </Text>
              </Touchable>
            </View>
          ) : campaigns.length === 0 ? (
            <View
              className="items-center rounded-2xl border border-dashed px-5 py-10"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Ionicons
                name="heart-dislike-outline"
                size={42}
                color={colors.textSecondary}
              />
              <Text
                className="mt-3 text-lg font-bold"
                style={{ color: colors.text }}
              >
                Chưa có Chiến dịch gây quỹ khả dụng
              </Text>
              <Text
                className="mt-2 text-center text-sm"
                style={{ color: colors.textSecondary }}
              >
                Hiện chưa có Chiến dịch gây quỹ nào đang Hoạt động để bạn thực
                hiện donate.
              </Text>
            </View>
          ) : (
            campaigns.map((campaign: any) => (
              <Press
                key={campaign.campaignId}
                onPress={() =>
                  router.push({
                    pathname: '/donate',
                    params: { campaignId: campaign.campaignId },
                  })
                }
                className="rounded-2xl border p-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-base font-bold leading-6"
                      style={{ color: colors.text }}
                    >
                      {campaign.name}
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {new Date(campaign.startDate).toLocaleDateString('vi-VN')}{' '}
                      - {new Date(campaign.endDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${colors.primary}14` }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: colors.primary }}
                    >
                      {typeof campaign.overallProgressPercent === 'number'
                        ? `${Math.round(campaign.overallProgressPercent)}%`
                        : 'Đang mở'}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="megaphone-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.primary }}
                    >
                      Chiến dịch gây quỹ đang mở
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </Press>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
