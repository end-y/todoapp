import { View, Text } from 'react-native';
import { Divider } from '@/components/Divider';

const ImportantTaskScreen = () => {
  return (
    <View>
      <Text className={styles.text}>Önemli Görevler</Text>
      <Divider />
    </View>
  );
};

export default ImportantTaskScreen;

const styles = {
  text: 'text-white text-4xl font-bold',
};
