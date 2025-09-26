import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';

export default function DatePickerModal() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams();

  // URL parametrelerinden başlangıç tarihini al
  const initialDate = params.initialDate ? new Date(params.initialDate as string) : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    if (params.initialDate) {
      setSelectedDate(new Date(params.initialDate as string));
    }
  }, [params.initialDate]);

  const handleDateChange = (event: any, date?: Date) => {
    if (date && event.type === 'set') {
      setSelectedDate(date);
      // Seçilen tarihi callback olarak geri gönder
      const dateString = date.toISOString().split('T')[0];

      // Global event veya AsyncStorage kullanarak veriyi gönder
      if ((global as any).datePickerCallback) {
        (global as any).datePickerCallback(dateString);
      }
    }
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Backdrop - kullanıcı buraya tıklayarak modal'ı kapatabilir */}
      <Pressable style={{ flex: 1 }} onPress={router.back} />

      <View className={styles.content} style={{ height: height / 3 }}>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          textColor="#000000"
        />
      </View>
    </View>
  );
}

const styles = {
  content:
    'h-96 bg-white absolute bottom-0 left-0 right-0 justify-center items-center rounded-t-3xl',
};
