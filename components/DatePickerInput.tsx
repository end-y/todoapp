import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { DatePickerInputProps } from '@/types';

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onDateChange,
  placeholder = 'Tarih seçin',
  label,
  className = '',
}) => {
  useEffect(() => {
    // Global callback'i ayarla
    (global as any).datePickerCallback = onDateChange;

    // Cleanup function
    return () => {
      (global as any).datePickerCallback = undefined;
    };
  }, [onDateChange]);

  const handlePress = () => {
    if (value) {
      router.push({
        pathname: '/date-picker-modal',
        params: { initialDate: value },
      });
    } else {
      router.push('/date-picker-modal');
    }
  };

  return (
    <View className={className}>
      <Text className="mb-2 text-lg font-semibold text-black">{label}</Text>
      <TouchableOpacity
        onPress={handlePress}
        className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-base text-black">
        <Text className={value ? 'text-black' : 'text-gray-500'}>
          {value ? new Date(value).toLocaleDateString('tr-TR') : placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DatePickerInput;
