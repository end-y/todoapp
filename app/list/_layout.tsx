import { Stack, Slot, useLocalSearchParams } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import Swipable from '@/components/Swipable';
import AddTaskButton from '@/components/AddTaskButton';
import OptimizedFlatList from '@/components/OptimizedFlatList';
import {
  useCreateTask,
  useDeleteTask,
  useGetScheduledTasks,
  useGetImportantTasks,
  useGetTodayTasks,
  useGetUnassignedTasks,
  useGetTasksByListId,
  useUpdateTask,
} from '@/query-management/task';
import { ScreenProvider } from './context';
import PageHeader from '@/components/PageHeader';
import TaskItem from '@/components/TaskItem';
import ListNavigation from '@/navigations/list-navigations';
import { DefaultListId } from '@/types';
import { useListStore } from '@/stores/listStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useIsFocused } from '@react-navigation/native';

export default function ScreensLayout() {
  const params = useLocalSearchParams();

  // Simple local state instead of reducers
  const [currentListId, setCurrentListId] = useState<number | null>(null);
  const [listName, setListName] = useState('Adsız Başlık');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  const { withErrorHandling } = useErrorHandler('ListLayout');
  const { tasks, filter, setTasks } = useListStore();
  const isFocused = useIsFocused();
  // Tüm hook'ları unconditional çağır
  const scheduledTasksQuery = useGetScheduledTasks();
  const importantTasksQuery = useGetImportantTasks();
  const todayTasksQuery = useGetTodayTasks();
  const unassignedTasksQuery = useGetUnassignedTasks();
  const listTasksQuery = useGetTasksByListId(currentListId || 0);

  // Aktif query'yi seç
  const getActiveQuery = useCallback(() => {
    const page = params.screen;
    switch (page) {
      case 'planned-tasks':
        return scheduledTasksQuery;
      case 'important-tasks':
        return importantTasksQuery;
      case 'today-tasks':
        return todayTasksQuery;
      case 'unassigned-tasks':
        return unassignedTasksQuery;
      case 'handle-list':
        return listTasksQuery;
      default:
        return { data: [] };
    }
  }, [
    params.screen,
    scheduledTasksQuery,
    importantTasksQuery,
    todayTasksQuery,
    unassignedTasksQuery,
    listTasksQuery,
  ]);

  const getPriority = useCallback(() => {
    if (params.screen === 'important-tasks') {
      return 'high';
    }
    return 'medium';
  }, [params.screen]);
  const isPlannedTasks = useCallback(() => {
    return params.screen === 'planned-tasks';
  }, [params.screen]);
  const { data: existingTasks = [] } = getActiveQuery();
  const handleAddTask = useCallback(
    async (taskName: string, description?: string, dueDate?: string) => {
      // Liste ID'sini state'ten al

      if (!taskName.trim()) {
        console.warn('Liste ID veya task adı eksik');
        return;
      }
      let task: any = {
        name: taskName,
        list_id: currentListId ?? DefaultListId,
        description: description ?? '',
        status: 'pending',
        priority: getPriority(),
        is_completed: false,
      };
      if (isPlannedTasks() || dueDate) {
        task.due_date = dueDate ?? new Date().toISOString();
      }
      const safeCreateTask = withErrorHandling(
        async (taskData: any) => {
          await createTaskMutation.mutateAsync(taskData);
        },
        {
          showToast: true,
          logError: true,
        }
      );

      await safeCreateTask(task);
    },
    [currentListId, createTaskMutation, withErrorHandling]
  );

  const contextValue = {
    currentListId,
    listName,
    isLoading,
    error,
    setCurrentListId,
    setListName,
    setIsLoading,
    setError,
    handleAddTask,
  };

  const handleDeleteTask = useCallback(
    (task: any) => {
      deleteTaskMutation.mutate(task.id);
    },
    [deleteTaskMutation]
  );

  const handleToggleComplete = useCallback(
    (task: any) => {
      updateTaskMutation.mutate({ id: task.id, task: { is_completed: !task.is_completed } });
      // TODO: API call to update task completion
    },
    [updateTaskMutation]
  );

  const getContainerColor = useCallback(() => {
    return `bg-${params.color ?? 'purple'}`;
  }, [params.color]);

  // Simplified task management - sadece React Query data'sını kullan
  const displayTasks = useCallback(() => {
    let finalTasks = existingTasks;

    // Zustand store'dan tasks varsa onları kullan (modal operations için)
    if (tasks.length > 0) {
      finalTasks = tasks;
    }

    // Filter varsa uygula
    if (filter && finalTasks.length > 0 && isPlannedTasks()) {
      finalTasks = finalTasks.filter((task) => filter(task));
    }

    return finalTasks;
  }, [existingTasks, tasks, filter, isFocused]);
  const renderTaskItem = useCallback(
    ({ item }: { item: any }) => (
      <Swipable key={item.id} onDelete={() => handleDeleteTask(item)}>
        <TaskItem color={params.color} task={item} onToggleComplete={handleToggleComplete} />
      </Swipable>
    ),
    [params.color, handleDeleteTask, handleToggleComplete]
  );
  useEffect(() => {
    setTasks(displayTasks());
  }, [isFocused]);
  return (
    <ScreenProvider value={contextValue}>
      <View className={[styles.container, getContainerColor()].join(' ')}>
        <View className={styles.container_inner}>
          <ListNavigation list={displayTasks()} backgroundColor={getContainerColor()} />
          {/* Hata mesajları */}
          {error && <Text className={styles.errorText}>{error}</Text>}

          {/* Task listesi */}
          {displayTasks().length > 0 && (
            <View className={styles.taskListContainer}>
              <Text className={styles.taskListTitle}>Görevler ({displayTasks().length})</Text>
              <OptimizedFlatList
                data={displayTasks()}
                renderItem={renderTaskItem}
                className={styles.taskList}
                contentContainerStyle={{
                  gap: 5,
                }}
                itemHeight={60}
                gap={5}
                enablePlatformOptimization={true}
              />
            </View>
          )}
          {/* Ortak AddTaskButton - Tüm screens'lerde görünür */}
          <AddTaskButton backgroundColor={getContainerColor()} onAddTask={handleAddTask} />
        </View>
      </View>
    </ScreenProvider>
  );
}

const styles = {
  container_inner: 'flex-1',
  container: 'flex-1 p-4',
  textInput: 'text-white text-3xl font-bold bg-transparent border-b border-white/30 px-2',
  errorText: 'text-red-400 text-center mt-4 text-lg',
  taskListContainer: 'flex-[7] mt-1',
  taskListTitle: 'text-white text-xl font-semibold mb-3',
  taskList: 'flex-1',
};
