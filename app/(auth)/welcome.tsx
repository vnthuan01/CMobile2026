import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
	Image,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const splashSource = require('@/src/assets/images/splash_shrink.png');
  const imageScale = height / width > 2 ? 0.98 : 0.94;
  const frameBackground = 'rgba(30, 41, 59, 1)';

  return (
    <View className="flex-1" style={{ backgroundColor: frameBackground }}>
      <Image
        source={splashSource}
        resizeMode="contain"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width,
          height,
          transform: [{ scale: imageScale }],
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.40)',
        }}
      />

      <View
        className="flex-1 justify-end px-6"
        style={{ paddingTop: top + 12, paddingBottom: bottom + 20 }}
      >
        <View
          className="self-center rounded-2xl border p-5"
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-[32px] font-bold"
            style={{ color: colors.text }}
          >
            Sẵn sàng bắt đầu?
          </Text>
          <Text
            className="mt-2 text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Đăng nhập để nhận hỗ trợ khẩn cấp và cập nhật tình hình thiên tai.
          </Text>

          <TouchableOpacity
            className="mt-5 h-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.primary }}
            onPress={() => router.replace('/login')}
          >
            <Text className="text-base font-bold text-white">Bắt đầu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
