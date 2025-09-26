import { View } from 'react-native';

export const Divider = () => {
  return <View className={styles.divider} />;
};

const styles = {
  divider: 'h-[1px] my-1 w-full bg-gray-200',
};
