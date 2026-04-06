import '@/global.css'
import { useTheme } from '@/src/context/ThemeContext'
import { useRouter } from 'expo-router'
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
	const router = useRouter()
	const { colors } = useTheme()
	const { top, bottom } = useSafeAreaInsets()

	const splashSource = require('@/src/assets/images/splash_shrink.png')

	return (
		<View className="flex-1" style={{ backgroundColor: colors.background }}>
			<ImageBackground
				source={splashSource}
				resizeMode="cover"
				style={{ flex: 1 }}
			>
				<View
					pointerEvents="none"
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'transparent',
						opacity: 0.5,
					}}
				/>

				<View
					className="flex-1 justify-end px-6"
					style={{ paddingTop: top + 12, paddingBottom: bottom + 20 }}
				>
					<View
						className="rounded-2xl border p-5"
						style={{
							backgroundColor: colors.background,
							opacity: 0.7,
							borderColor: colors.border,
						}}
					>
						<Text className="text-xl font-bold" style={{ color: colors.text }}>
							Sẵn sàng bắt đầu?
						</Text>
						<Text
							className="mt-2 text-base leading-relaxed"
							style={{ color: colors.textSecondary }}
						>
							Đăng nhập để nhận hỗ trợ khẩn cấp và cập nhật tình hình thiên tai.
						</Text>

						<TouchableOpacity
							className="mt-5 h-12 items-center justify-center rounded-xl bg-primary"
							onPress={() => router.replace('/login')}
						>
							<Text className="text-base font-bold text-white">Bắt đầu</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ImageBackground>
		</View>
	)
}
