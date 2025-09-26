import PageHeader from '@/components/PageHeader';
import { Stack } from 'expo-router';

const TaskNavigation = ({
  color,
  isEditMode,
  handleSave,
}: {
  color: string;
  isEditMode: boolean;
  handleSave: () => void;
}) => {
  return (
    <Stack.Screen
      options={{
        header: () => (
          <PageHeader
            backgroundColor={`bg-${color}`}
            title={isEditMode ? 'Görevi Düzenle' : 'Yeni Görev'}
            rightIconText="save"
            onRightButtonPress={handleSave}
          />
        ),
      }}
    />
  );
};

export default TaskNavigation;
