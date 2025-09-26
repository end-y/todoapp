import { TextInput } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useCallback } from 'react';
import { useCreateList, useUpdateList, useGetListById } from '@/query-management/list';
import { useScreenContext } from './context';
import { useListStore } from '@/stores/listStore';
import { useIsFocused } from '@react-navigation/native';

export default function HandleListScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const listId = id ? parseInt(id) : null;
  const isEditMode = !!listId;
  const { setListRef } = useListStore();
  const ref = useRef<TextInput>(null);
  const isFocused = useIsFocused();
  // Shared context'ten list state'i al
  const { listState, listDispatch, setCurrentListId } = useScreenContext();

  // React Query hooks
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();

  const { data: existingList } = useGetListById(listId || 0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdateList = useCallback(
    async (id: number, name: string) => {
      if (!name.trim()) return;

      try {
        await updateListMutation.mutateAsync({ id, name });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Liste güncellenirken hata';
        listDispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    },
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
      const createInitialList = async () => {
        listDispatch({ type: 'SET_LOADING', payload: true });
        try {
          const result = await createListMutation.mutateAsync(listState.name);
          setCurrentListId(result.lastInsertRowId as number);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Liste oluşturulurken hata';
          listDispatch({ type: 'SET_ERROR', payload: errorMessage });
          console.error('Liste oluşturulurken hata:', error);
        } finally {
          listDispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      createInitialList();
    }
  }, [isEditMode]); // Sadece mode değiştiğinde çalışsın

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
