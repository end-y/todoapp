import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Expo ikonlarını kullanıyorum
import { useColorScheme } from 'nativewind'; // useColorScheme hook'unu içe aktar
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderProps } from '@/types';

export default function Header({ name, profileImage, onSearchPress }: HeaderProps) {
  const { top, bottom } = useSafeAreaInsets(); // Üst dolguyu al
  return (
    <View className={styles.container} style={{ paddingTop: top }}>
      <View className={styles.leftContainer}>
        <Image source={{ uri: profileImage }} className={styles.profileImage} />
        <Text className={styles.nameText}>{name}</Text>
      </View>
      <TouchableOpacity onPress={onSearchPress} className={styles.rightContainer}>
        <Text className="text-textPrimary">
          <Ionicons name="search" size={24} />
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container:
    'flex-row items-center bg-background justify-between border-b border-b-gray-200 bg-white py-4 px-4',
  leftContainer: 'flex-row items-center',
  profileImage: 'mr-2 h-10 w-10 rounded-full',
  nameText: 'text-2xl font-bold ml-1 text-textPrimary',
  rightContainer: 'p-1',
};
