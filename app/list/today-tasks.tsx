import { View, Text } from 'react-native';
import { Divider } from '@/components/Divider';

const TodayTasksScreen = () => {
  return (
    <View>
      <Text className={styles.text}>Bugünün Görevleri</Text>
      <Text className={styles.date}>{new Date().toString().split(' ').slice(0, 3).join(' ')}</Text>
      <Divider />
    </View>
  );
};

export default TodayTasksScreen;

const styles = {
  text: 'text-white text-4xl font-bold',
  date: 'text-white text-lg font-bold',
};
