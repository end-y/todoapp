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

export default function ScreensLayout() {
  const params = useLocalSearchParams();
  const [listState, listDispatch] = useReducer(listElementReducer, initialListState);
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  const [taskState, taskDispatch] = useReducer(taskReducer, initialTaskState);
  const { tasks, setTasks, filter } = useListStore();
  // Task ekleme fonksiyonu - tüm screens'lerde kullanılabilir
  const getList = useCallback(() => {
    const page = params.screen;
    switch (page) {
      case 'planned-tasks':
        return useGetScheduledTasks();
      case 'important-tasks':
        return useGetImportantTasks();
      case 'today-tasks':
        return useGetTodayTasks();
      case 'unassigned-tasks':
        return useGetUnassignedTasks();
      case 'handle-list':
        return useGetTasksByListId(listState.id || 0);
    }
  }, [params.screen, listState.id]);

  const getPriority = useCallback(() => {
    if (params.screen === 'important-tasks') {
      return 'high';
    }
    return 'medium';
  }, [params.screen]);
  const isPlannedTasks = useCallback(() => {
    return params.screen === 'planned-tasks';
  }, [params.screen]);
  const { data: existingTasks = [] } = getList() || { data: [] };
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
      try {
        await createTaskMutation.mutateAsync(task);
        // React Query cache invalidation sayesinde otomatik yüklenecek
      } catch (error) {
        console.error('Task eklenirken hata:', error);
        const errorMessage = error instanceof Error ? error.message : 'Task eklenirken hata';
        listDispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    },
    [listState.id, createTaskMutation]
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
    return `${'bg-' + (params.color ?? 'purple')}`;
  }, [params.color]);
  // Task'ları yükle (hem create hem edit mode için)
  useEffect(() => {
    if (existingTasks.length > 0) {
      taskDispatch({ type: 'SET_TASKS', payload: existingTasks });
    }
  }, [existingTasks]);
  useEffect(() => {
    if (filter) {
      taskDispatch({ type: 'SET_TASKS', payload: existingTasks.filter((task) => filter(task)) });
    }
  }, [existingTasks, filter]);
  useEffect(() => {
    if (tasks.length > 0) {
      taskDispatch({ type: 'SET_TASKS', payload: tasks });
    }
  }, [tasks]);
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
