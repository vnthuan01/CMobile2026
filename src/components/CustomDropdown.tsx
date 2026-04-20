import React, { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  title?: string;
}

export default function CustomDropdown({
  items,
  selectedValue,
  onValueChange,
  placeholder = '-- Chọn --',
  title = 'Chọn mục',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();
  const { height } = useWindowDimensions();

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
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setIsOpen(false)} />
          <View>
            <View
              className="rounded-t-3xl"
              style={{ backgroundColor: colors.card, height: Math.min(height * 0.78, 640) }}
            >
              <View className="items-center pt-3">
                <View
                  className="h-1.5 w-14 rounded-full"
                  style={{ backgroundColor: colors.border }}
                />
              </View>
              {/* Header */}
              <View
                className="p-5"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
              >
                <Text
                  className="font-inter text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  {title}
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
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
