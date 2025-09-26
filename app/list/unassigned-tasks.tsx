import { Divider } from '@/components/Divider';
import { View, Text } from 'react-native';

const UnassignedTasksScreen = () => {
  return (
    <View>
      <Text className={styles.text}>Unassigned Tasks</Text>
      <Divider />
    </View>
  );
};

export default UnassignedTasksScreen;

const styles = {
  text: 'text-white text-4xl font-bold',
};
