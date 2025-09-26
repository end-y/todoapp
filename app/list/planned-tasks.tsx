import { Divider } from '@/components/Divider';
import { View, Text } from 'react-native';

const PlannedTasksScreen = () => {
  return (
    <View>
      <Text className={styles.text}>Planlanmış Görevler</Text>
      <Divider />
    </View>
  );
};

export default PlannedTasksScreen;

const styles = {
  text: 'text-white text-4xl font-bold',
};
