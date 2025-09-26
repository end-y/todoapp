import { router, Stack } from 'expo-router';
import { Divider } from '@/components/Divider';
import { useMemo, useEffect, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import Swipable from '../components/Swipable';
import OptimizedFlatList from '@/components/OptimizedFlatList';
import { useDeleteListById, useGetAllLists } from '@/query-management/list';
import {
  useGetAllTasks,
  useGetImportantTasks,
  useGetScheduledTasks,
  useGetTodayTasks,
  useGetUnassignedTasks,
} from '@/query-management/task';

export default function HomeScreen() {
  const { bottom } = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const deleteListMutation = useDeleteListById();
  // React Query hooks
  const { data: scheduledTasks } = useGetScheduledTasks();
  const { data: importantTasks } = useGetImportantTasks();
  const { data: todayTasks } = useGetTodayTasks();
  const { data: unassignedTasks } = useGetUnassignedTasks();
  const {
    data: lists = [],
    isLoading: listsLoading,
    error: listsError,
    isError: listsIsError,
  } = useGetAllLists();
  const { data: tasks = [] } = useGetAllTasks();
  // Önceki data'yı sakla (infinite loop'u önlemek için)
  const prevDataRef = useRef({ lists: [] as any[], tasks: [] as any[] });

  // React Query data'sını Zustand ile senkronize et
  useEffect(() => {
    // Data gerçekten değişti mi kontrol et
    const listsChanged = JSON.stringify(prevDataRef.current.lists) !== JSON.stringify(lists);
    const tasksChanged = JSON.stringify(prevDataRef.current.tasks) !== JSON.stringify(tasks);

    if ((listsChanged || tasksChanged) && (lists.length > 0 || tasks.length > 0)) {
      prevDataRef.current = { lists, tasks };
    }
  }, [lists, tasks]); // syncWithReactQuery dependency'den çıkarıldı

  const taskFilterButtons: any[] = useMemo(
    () => [
      {
        id: 'scheduled-tasks',
        title: 'Planlanmış Görevler',
        icon: 'calendar-outline',
        iconColor: 'text-blue',
        count: scheduledTasks?.length.toString(),
        onPress: () => router.push('/list/planned-tasks?color=blue'),
      },
      {
        id: 'important-tasks',
        title: 'Önemli Görevler',
        icon: 'star-outline',
        iconColor: 'text-purple',
        count: importantTasks?.length.toString(),
        onPress: () => router.push('/list/important-tasks?color=purple'),
      },
      {
        id: 'today-tasks',
        title: 'Bugün Görevler',
        icon: 'today-outline',
        iconColor: 'text-green',
        count: todayTasks?.length.toString(),
        onPress: () => router.push('/list/today-tasks?color=green'),
      },
      {
        id: 'unassigned-tasks',
        title: 'Atanmamış Görevler',
        icon: 'person-outline',
        iconColor: 'text-pink',
        count: unassignedTasks?.length.toString(),
        onPress: () => router.push('/list/unassigned-tasks?color=pink'),
      },
    ],
    [scheduledTasks, importantTasks, todayTasks, unassignedTasks]
  );
  const bottomButtons: any[] = useMemo(
    () => [
      {
        id: 'create-list',
        title: 'Liste Oluştur',
        icon: 'add-outline',
        iconColor: 'text-blue',
        onPress: () => router.push('/list/handle-list?color=blue'),
      },
    ],
    []
  );

  // Kullanıcı listelerini CategoryList formatına dönüştür
  const userListButtons: any[] = useMemo(() => {
    if (!lists) return [];
    const newLists = lists.map((list) => ({
      id: list.id.toString(),
      title: list.name,
      icon: 'list-outline',
      iconColor: 'text-blue',
      count: tasks.filter((task) => task.list_id === list.id).length ?? 0,
      onPress: () => router.push(`/list/handle-list?id=${list.id}&color=blue`),
    }));
    return newLists;
  }, [lists, listsLoading, tasks]);
  const handleDeleteList = useCallback(
    (listId: any) => {
      return () => {
        deleteListMutation.mutate(parseInt(listId.id));
      };
    },
    [deleteListMutation]
  );

  const handleEditList = useCallback((listId: any) => {
    return () => {
      router.push(`/list/handle-list?id=${listId.id}&color=blue`);
    };
  }, []);

  return (
    <>
      <View className="flex-1 bg-background">
        <View className="px-4">
          <OptimizedFlatList
            data={taskFilterButtons}
            renderItem={({ item: button }) => (
              <Button key={button.id} {...button} className="m-2" />
            )}
            itemHeight={60} // Button yüksekliği
            enablePlatformOptimization={true}
            contentContainerStyle={{
              paddingVertical: 8,
              gap: 8,
            }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <Divider />
        {listsLoading && (
          <View className="p-4">
            <Button
              id="loading"
              title="Listeler yükleniyor..."
              backgroundColor="bg-gray-400"
              disabled={true}
            />
          </View>
        )}
        {listsIsError && (
          <View className="p-4">
            <Button
              id="error"
              title={`Hata: ${listsError?.message || 'Bilinmeyen hata'}`}
              backgroundColor="bg-red-500"
              onPress={() => queryClient.invalidateQueries({ queryKey: ['lists'] })}
            />
          </View>
        )}
        {!listsLoading && !listsIsError && userListButtons.length > 0 && (
          <View
            style={{
              flex: 1,
              paddingBottom: bottom + 20,
            }}>
            <OptimizedFlatList
              data={userListButtons}
              renderItem={({ item: button }) => (
                <Swipable
                  key={button.id}
                  onDelete={handleDeleteList(button)}
                  onEdit={handleEditList(button)}>
                  <Button {...button} onPress={handleEditList(button)} className="m-2" />
                </Swipable>
              )}
              itemHeight={70} // Swipable + Button yüksekliği
              enablePlatformOptimization={true}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
              }}
              style={{ flex: 1 }}
            />
          </View>
        )}
        <View className="px-4 pb-4">
          <OptimizedFlatList
            data={bottomButtons}
            renderItem={({ item: button }) => (
              <Button key={button.id} {...button} className="m-2" />
            )}
            itemHeight={60} // Button yüksekliği
            enablePlatformOptimization={true}
            contentContainerStyle={{
              paddingVertical: 8,
            }}
            horizontal={true}
          />
        </View>
      </View>
      <View className="bg-background" style={{ height: bottom }} />
    </>
  );
}
