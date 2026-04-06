import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

interface AppBottomSheetProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  snapPoints?: Array<string | number>;
}

export default function AppBottomSheet({
  open,
  onClose,
  children,
  snapPoints,
}: AppBottomSheetProps) {
  const ref = useRef<BottomSheet>(null);
  const { colors } = useTheme();
  const points = useMemo(() => snapPoints || ['48%', '78%'], [snapPoints]);

  useEffect(() => {
    if (open) {
      ref.current?.snapToIndex(0);
    } else {
      ref.current?.close();
    }
  }, [open]);

  return (
    <BottomSheet
      ref={ref}
      index={open ? 0 : -1}
      snapPoints={points}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 48 }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-1 px-4 pb-6">{children}</View>
      </BottomSheetView>
    </BottomSheet>
  );
}
