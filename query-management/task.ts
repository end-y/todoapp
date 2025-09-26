import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByListId,
  getTasksByStatus,
  getUpcomingTasks,
  updateTask,
} from '@/queries/tasks';
import { DefaultListId, Task } from '@/types';

export const useGetAllTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getAllTasks,
  });
};

export const useGetTaskById = (id: number) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
  });
};

export const useGetTasksByListId = (listId: number) => {
  return useQuery({
    queryKey: ['tasks', 'list', listId],
    queryFn: () => getTasksByListId(listId),
    enabled: listId > 0, // Sadece geçerli listId'ler için çalışsın
  });
};

export const useGetImportantTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'important'],
    queryFn: async () => {
      const allTasks = await getAllTasks();
      const filtered = allTasks.filter((task) => task.priority === 'high');
      return filtered;
    },
  });
};

export const useGetScheduledTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'scheduled'],
    queryFn: async () => {
      const allTasks = await getAllTasks();
      const filtered = allTasks.filter((task) => task.due_date);
      return filtered;
    },
  });
};

export const useGetTodayTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const allTasks = await getAllTasks();
      const filtered = allTasks.filter((task) => task.due_date?.startsWith(today));
      return filtered;
    },
  });
};

export const useGetUnassignedTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'unassigned'],
    queryFn: async () => {
      const allTasks = await getAllTasks();
      const filtered = allTasks.filter((task) => task.list_id === DefaultListId || !task.list_id);
      return filtered;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      // Specific list tasks cache'ini de invalidate et
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
      Toast.show({
        type: 'success',
        text1: 'Görev oluşturuldu',
        text2: 'Yeni görev başarıyla oluşturuldu!',
        position: 'top',
        topOffset: 100,
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
      Toast.show({
        type: 'success',
        text1: 'Görev silindi',
        text2: 'Görev başarıyla silindi!',
        position: 'top',
        topOffset: 100,
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, task }: { id: number; task: Partial<Task> }) => updateTask(id, task as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
      Toast.show({
        type: 'success',
        text1: 'Görev güncellendi',
        text2: 'Görev başarıyla güncellendi!',
        position: 'top',
        topOffset: 100,
      });
    },
  });
};
