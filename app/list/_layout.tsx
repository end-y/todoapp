import { Stack, Slot, useLocalSearchParams } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { useReducer, useCallback, useEffect } from 'react';
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
import { listElementReducer, initialListState } from '@/reducers/list';
import { ScreenProvider } from './context';
import { initialTaskState, taskReducer } from '@/reducers/task';
import PageHeader from '@/components/PageHeader';
import TaskItem from '@/components/TaskItem';
import ListNavigation from '@/navigations/list-navigations';
import { DefaultListId } from '@/types';
import { useListStore } from '@/stores/listStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function ScreensLayout() {
  const params = useLocalSearchParams();
  const [listState, listDispatch] = useReducer(listElementReducer, initialListState);
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  const [taskState, taskDispatch] = useReducer(taskReducer, initialTaskState);
  const { handleError, handleQueryError, withErrorHandling } = useErrorHandler('ListLayout');
  const { tasks, setTasks, filter } = useListStore();
  // Tüm hook'ları unconditional çağır
  const scheduledTasksQuery = useGetScheduledTasks();
  const importantTasksQuery = useGetImportantTasks();
  const todayTasksQuery = useGetTodayTasks();
  const unassignedTasksQuery = useGetUnassignedTasks();
  const listTasksQuery = useGetTasksByListId(listState.id || 0);

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
      // Liste ID'sini context'ten veya params'tan al
      const currentListId = listState.id;

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
    [listState.id, createTaskMutation, withErrorHandling]
  );

  // Liste ID'sini set etme fonksiyonu
  const setCurrentListId = useCallback(
    (id: number) => {
      listDispatch({ type: 'SET_LIST_ID', payload: id });
    },
    [listDispatch]
  );

  const contextValue = {
    listState,
    listDispatch,
    handleAddTask,
    setCurrentListId,
  };
  const handleDeleteTask = useCallback(
    (task: any) => {
      taskDispatch({ type: 'DELETE_TASK', payload: task.id });
      deleteTaskMutation.mutate(task.id);
    },
    [deleteTaskMutation, taskDispatch]
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
  // Task'ları yükle ve filtrele - tek useEffect ile
  useEffect(() => {
    let finalTasks = existingTasks;

    // Önce existingTasks'ı kullan
    if (existingTasks.length > 0) {
      finalTasks = existingTasks;
    }

    // Zustand store'dan tasks varsa onları kullan
    if (tasks.length > 0) {
      finalTasks = tasks;
    }

    // Filter varsa uygula
    if (filter && finalTasks.length > 0) {
      finalTasks = finalTasks.filter((task) => filter(task));
    }

    // Sadece tasks gerçekten değiştiyse dispatch et
    if (finalTasks.length > 0 || taskState.tasks.length > 0) {
      taskDispatch({ type: 'SET_TASKS', payload: finalTasks });
    }
  }, [existingTasks, tasks, filter]); // Tüm dependencies bir arada
  const renderTaskItem = useCallback(
    ({ item }: { item: any }) => (
      <Swipable key={item.id} onDelete={() => handleDeleteTask(item)}>
        <TaskItem color={params.color} task={item} onToggleComplete={handleToggleComplete} />
      </Swipable>
    ),
    [params.color, handleDeleteTask, handleToggleComplete]
  );
  return (
    <ScreenProvider value={contextValue}>
      <View className={[styles.container, getContainerColor()].join(' ')}>
        <View className={styles.container_inner}>
          <ListNavigation list={taskState.tasks} backgroundColor={getContainerColor()} />
          {/* Hata mesajları */}
          {listState.error && <Text className={styles.errorText}>{listState.error}</Text>}
          {taskState.error && <Text className={styles.errorText}>{taskState.error}</Text>}

          {/* Task listesi */}
          {taskState.tasks.length > 0 && (
            <View className={styles.taskListContainer}>
              <Text className={styles.taskListTitle}>Görevler ({taskState.tasks.length})</Text>
              <OptimizedFlatList
                data={taskState.tasks}
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
