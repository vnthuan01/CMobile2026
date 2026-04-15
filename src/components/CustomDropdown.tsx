import { useTheme } from '@/src/context/ThemeContext';
import { useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomDropdown({
  items,
  selectedValue,
  onValueChange,
  placeholder = '-- Chọn --',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  const selectedLabel =
    items.find((item) => item.value === selectedValue)?.label || placeholder;

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center justify-between rounded-lg px-4 py-3"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          className="font-inter text-base"
          style={{ color: selectedValue ? colors.text : colors.textSecondary }}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Text style={{ color: colors.icon }}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-end">
            <View
              className="max-h-96 rounded-t-2xl"
              style={{ backgroundColor: colors.card }}
            >
              {/* Header */}
              <View
                className="p-5"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  className="font-inter text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Chọn mẫu xe
                </Text>
              </View>

              {/* Items */}
              <FlatList
                data={items}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-5"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor:
                        selectedValue === item.value
                          ? `${colors.info}18`
                          : 'transparent',
                    }}
                    onPress={() => {
                      onValueChange(item.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text
                      className="font-inter text-base"
                      style={{
                        color:
                          selectedValue === item.value
                            ? colors.info
                            : colors.text,
                        fontWeight:
                          selectedValue === item.value ? '600' : '400',
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
