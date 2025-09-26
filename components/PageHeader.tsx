import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { PageHeaderProps } from '@/types';

export default function PageHeader({
  title,
  onRightButtonPress,
  rightIconText = 'ellipsis-horizontal',
  backgroundColor = 'bg-purple',
}: PageHeaderProps) {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View className={[styles.container, backgroundColor].join(' ')} style={{ paddingTop: top }}>
      <TouchableOpacity onPress={handleGoBack} className={styles.leftContainer}>
        <Text className={styles.backButtonText}>
          <Ionicons name="chevron-back" size={24} />
        </Text>
        <Text className={styles.backButtonText}>{'Geri'}</Text>
        {/* 'Geri' veya önceki ekran başlığı */}
      </TouchableOpacity>
      <View className={styles.titleContainer}>
        <Text className={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onRightButtonPress} className={styles.rightContainer}>
        <Text className={styles.rightButtonText}>
          <Ionicons name={rightIconText as keyof typeof Ionicons.glyphMap} size={24} />
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: 'flex-row items-center justify-between py-2',
  titleContainer: 'flex-0.8 text-center',
  leftContainer: 'flex-[0.2] flex-row items-center p-1',
  rightContainer: 'flex-0.5 flex-row items-center justify-end p-1 pr-5',
  title: 'text-white text-xl font-bold text-center',
  backButton: 'flex-row items-center p-1',
  backButtonText: 'text-white ml-1 text-lg',
  rightButton: 'p-1',
  rightButtonText: 'text-white',
};
