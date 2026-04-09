import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ImageUploaderProps {
    images: string[];
    onAddImage?: () => void;
    onRemoveImage?: (index: number) => void;
}

export default function ImageUploader({
    images,
    onAddImage,
    onRemoveImage,
}: ImageUploaderProps) {
    const { colors } = useTheme();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
        >
            {/* Add photo button */}
            <TouchableOpacity
                onPress={onAddImage}
                className="h-28 w-28 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed"
                style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                }}
            >
                <Ionicons name="camera-outline" size={30} color={colors.secondary} />
                <Text
                    className="mt-1 text-xs font-medium"
                    style={{ color: colors.secondary }}
                >
                    Thêm ảnh
                </Text>
            </TouchableOpacity>

            {/* Image thumbnails */}
            {images.map((uri, index) => (
                <View
                    key={index}
                    className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl"
                    style={{
                        backgroundColor: colors.surface,
                    }}
                >
                    {uri ? (
                        <Image
                            source={{ uri }}
                            className="h-full w-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <Ionicons name="image" size={40} color={colors.icon} />
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => onRemoveImage?.(index)}
                        className="absolute right-1 top-1 rounded-full p-1"
                        style={{ backgroundColor: colors.overlay }}
                    >
                        <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
}
