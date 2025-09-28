import PageHeader from '@/components/PageHeader';
import { useListStore } from '@/stores/listStore';
import { List, Task } from '@/types';
import { router, Slot, Stack } from 'expo-router';

const ListNavigation = ({ backgroundColor, list }: { backgroundColor: string; list: Task[] }) => {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <PageHeader
              title="Yeni Liste"
              onRightButtonPress={() => {
                router.push('/list-settings-modal');
              }}
              backgroundColor={backgroundColor}
            />
          ),
        }}
      />

      <Slot />
    </>
  );
};

export default ListNavigation;
