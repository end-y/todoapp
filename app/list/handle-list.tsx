import { TextInput } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useCallback } from 'react';
import { useCreateList, useUpdateList, useGetListById } from '@/query-management/list';
import { useScreenContext } from './context';
import { useListStore } from '@/stores/listStore';
import { useIsFocused } from '@react-navigation/native';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function HandleListScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const listId = id ? parseInt(id) : null;
  const isEditMode = !!listId;
  const { setListRef } = useListStore();
  const ref = useRef<TextInput>(null);
  const isFocused = useIsFocused();
  // Shared context'ten list state'i al
  const { listState, listDispatch, setCurrentListId } = useScreenContext();
  const { withErrorHandling } = useErrorHandler('HandleListScreen');

  // React Query hooks
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();

  const { data: existingList } = useGetListById(listId || 0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdateList = useCallback(
    withErrorHandling(
      async (id: number, name: string) => {
        if (!name.trim()) return;
        await updateListMutation.mutateAsync({ id, name });
      },
      {
        showToast: true,
        logError: true,
      }
    ),
    [updateListMutation]
  );

  // Edit mode için mevcut listeyi yükle
  useEffect(() => {
    if (isEditMode && existingList) {
      setCurrentListId(existingList.id);
      listDispatch({ type: 'UPDATE_LIST_NAME', payload: existingList.name });
    }
  }, [isEditMode, existingList, setCurrentListId]);

  // Create mode için yeni liste oluştur
  useEffect(() => {
    if (!isEditMode) {
      const createInitialList = withErrorHandling(
        async () => {
          listDispatch({ type: 'SET_LOADING', payload: true });
          const result = await createListMutation.mutateAsync(listState.name);
          setCurrentListId(result.lastInsertRowId as number);
          listDispatch({ type: 'SET_LOADING', payload: false });
        },
        {
          showToast: true,
          logError: true,
        }
      );

      createInitialList();
    }
  }, [
    isEditMode,
    withErrorHandling,
    createListMutation,
    listState.name,
    setCurrentListId,
    listDispatch,
  ]);

  const handleTextChange = (text: string) => {
    listDispatch({ type: 'UPDATE_LIST_NAME', payload: text });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (listState.id) {
      debounceTimerRef.current = setTimeout(() => {
        debouncedUpdateList(listState.id!, text);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isFocused && ref) {
      setListRef(ref);
    }
  }, [isFocused, ref]);

  return (
    <TextInput
      ref={ref}
      value={listState.name}
      className={styles.textInput}
      onChangeText={handleTextChange}
      selectTextOnFocus={true}
      returnKeyType="done"
      editable={!listState.isLoading}
      placeholder={isEditMode ? 'Liste adını düzenle...' : 'Yeni liste adı...'}
      placeholderTextColor="rgba(255,255,255,0.5)"
    />
  );
}

const styles = {
  container: 'flex-1 bg-purple p-4',
  textInput: 'text-white text-3xl font-bold bg-transparent border-b border-white/30 px-2',
  errorText: 'text-red-400 text-center mt-4 text-lg',
  taskListContainer: 'flex-1 mt-6',
  taskListTitle: 'text-white text-xl font-semibold mb-3',
  taskList: 'flex-1',
  taskItem: 'bg-white/10 rounded-lg p-3 flex-row justify-between items-center',
  taskText: 'text-textPrimary text-base font-medium flex-1',
  taskStatus: 'text-white/70 text-sm capitalize',
};
