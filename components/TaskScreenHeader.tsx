import { View, Text } from 'react-native';
import { Divider } from '@/components/Divider';

interface TaskScreenHeaderProps {
  title: string;
  subtitle?: string;
  showDate?: boolean;
}

const TaskScreenHeader = ({ title, subtitle, showDate }: TaskScreenHeaderProps) => {
  const currentDate = showDate ? new Date().toString().split(' ').slice(0, 3).join(' ') : null;

  return (
    <View>
      <Text className="text-4xl font-bold text-white">{title}</Text>
      {subtitle && <Text className="text-lg font-bold text-white">{subtitle}</Text>}
      {currentDate && <Text className="text-lg font-bold text-white">{currentDate}</Text>}
      <Divider />
    </View>
  );
};

export default TaskScreenHeader;
