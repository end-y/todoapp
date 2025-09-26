import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createList, deleteList, getAllLists, getListById, updateList } from '@/queries/lists';

export const useGetAllLists = () => {
  return useQuery({
    queryKey: ['lists'],
    queryFn: getAllLists,
    staleTime: 5 * 60 * 1000, // 5 dakika boyunca fresh kabul et
    gcTime: 10 * 60 * 1000, // 10 dakika cache'te tut (eski cacheTime)
    retry: 3, // 3 kez deneme yap
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Pencere odağına geldiğinde tekrar fetch etme
    refetchOnMount: 'always', // Component mount olduğunda her zaman fetch et
  });
};

export const useGetListById = (id: number) => {
  return useQuery({
    queryKey: ['list', id],
    queryFn: () => getListById(id),
    enabled: id > 0, // Sadece geçerli ID'ler için çalışsın
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateList(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};

export const useDeleteListById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      // Lists cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      // Tasks cache'ini de invalidate et (listStore için)
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
