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
  const {
    currentListId,
    listName,
    isLoading,
    setCurrentListId,
    setListName,
    setIsLoading,
    setError,
  } = useScreenContext();
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
      setListName(existingList.name);
    }
  }, [isEditMode, existingList, setCurrentListId, setListName]);

  // Create mode için yeni liste oluştur - sadece bir kez
  useEffect(() => {
    if (!isEditMode && !currentListId && !isLoading) {
      const createInitialList = withErrorHandling(
        async () => {
          setIsLoading(true);
          const result = await createListMutation.mutateAsync(listName);
          setCurrentListId(result.lastInsertRowId as number);
          setIsLoading(false);
        },
        {
          showToast: true,
          logError: true,
        }
      );

      createInitialList();
    }
  }, [isEditMode, currentListId, isLoading]);

  const handleTextChange = (text: string) => {
    setListName(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (currentListId) {
      debounceTimerRef.current = setTimeout(() => {
        debouncedUpdateList(currentListId, text);
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
      value={listName}
      className={styles.textInput}
      onChangeText={handleTextChange}
      selectTextOnFocus={true}
      returnKeyType="done"
      editable={!isLoading}
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
