import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { searchListsByName } from '@/queries/lists';
import { searchTasksByName } from '@/queries/tasks';
import { List, Task } from '@/types/entities';

interface SearchResult {
  lists: List[];
  tasks: Task[];
  isLoading: boolean;
}

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult>({
    lists: [],
    tasks: [],
    isLoading: false,
  });

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResult({ lists: [], tasks: [], isLoading: false });
      return;
    }

    setSearchResult((prev) => ({ ...prev, isLoading: true }));

    try {
      const [lists, tasks] = await Promise.all([
        searchListsByName(query),
        searchTasksByName(query),
      ]);

      setSearchResult({
        lists,
        tasks,
        isLoading: false,
      });
    } catch (error) {
      console.error('Arama hatası:', error);
      setSearchResult({
        lists: [],
        tasks: [],
        isLoading: false,
      });
    }
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  const handleListPress = (listId: number) => {
    router.dismiss();
    router.push(`/list/handle-list?id=${listId}&color=blue`);
  };

  const handleTaskPress = (taskId: number) => {
    router.dismiss();
    router.push(`/task/task-detail?id=${taskId}`);
  };

  const handleClose = () => {
    router.dismiss();
  };

  const hasResults = searchResult.lists.length > 0 || searchResult.tasks.length > 0;

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.modal}>
          {/* Header */}
          <View className={styles.header}>
            <View className={styles.inputContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className={styles.input}
                placeholder="Listeler ve görevler ara..."
                value={searchQuery}
                onChangeText={handleInputChange}
                autoFocus
                placeholderTextColor="#666"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleInputChange('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} className={styles.cancelButton}>
              <Text className={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className={styles.scrollView}>
            {searchResult.isLoading && (
              <View className={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className={styles.loadingText}>Aranıyor...</Text>
              </View>
            )}

            {!searchResult.isLoading && searchQuery.length > 0 && !hasResults && (
              <View className={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text className={styles.noResultsText}>"{searchQuery}" için sonuç bulunamadı</Text>
              </View>
            )}

            {!searchResult.isLoading && searchQuery.length === 0 && (
              <View className={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text className={styles.noResultsText}>
                  Listeler ve görevler arasında arama yapın
                </Text>
              </View>
            )}

            {/* Lists Section */}
            {searchResult.lists.length > 0 && (
              <View className="p-4">
                <Text className={styles.listsTitle}>Listeler ({searchResult.lists.length})</Text>
                {searchResult.lists.map((list) => (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() => handleListPress(list.id)}
                    className={styles.listsItem}>
                    <View className={styles.listsItemIcon}>
                      <Ionicons name="list" size={16} color="white" />
                    </View>
                    <View className={styles.listsItemContent}>
                      <Text className={styles.listsItemText}>{list.name}</Text>
                      <Text className={styles.listsItemSubtext}>Liste</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Tasks Section */}
            {searchResult.tasks.length > 0 && (
              <View className="p-4">
                <Text className={styles.tasksTitle}>Görevler ({searchResult.tasks.length})</Text>
                {searchResult.tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    onPress={() => handleTaskPress(task.id)}
                    className={styles.tasksItem}>
                    <View className={styles.tasksItemIcon}>
                      <Ionicons name="checkmark-circle" size={16} color="white" />
                    </View>
                    <View className={styles.tasksItemContent}>
                      <Text className={styles.tasksItemText}>{task.name}</Text>
                      <Text className={styles.tasksItemSubtext}>
                        {task.description || 'Görev'}
                        {task.is_completed && ' • Tamamlandı'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
const styles = {
  container: 'flex-1',
  scrollView: 'flex-1',
  content: 'flex-1 justify-center px-4',
  listsItemIcon: 'bg-blue-500 mr-3 h-8 w-8 items-center justify-center rounded-full',
  listsItemContent: 'flex-1',
  tasksItemIcon: 'bg-green-500 mr-3 h-8 w-8 items-center justify-center rounded-full',
  tasksItemContent: 'flex-1',
  modal: 'bg-white rounded-lg flex-1 ',
  header: 'flex-row items-center border-b border-gray-200 p-4',
  input: 'ml-2 flex-1 text-base',
  inputContainer: 'flex-1 flex-row items-center rounded-lg bg-gray-100 px-3 py-2',
  cancelButton: 'ml-3',
  cancelButtonText: 'text-blue-500 text-base font-medium',
  loadingContainer: 'items-center p-8',
  loadingText: 'mt-2 text-gray-500',
  noResultsContainer: 'items-center p-8',
  noResultsText: 'mt-2 text-center text-gray-500',
  listsContainer: 'p-4',
  listsTitle: 'mb-3 text-lg font-semibold text-gray-800',
  listsItem: 'bg-blue-50 mb-2 flex-row items-center rounded-lg p-3',
  listsItemText: 'text-base font-medium text-gray-800',
  listsItemSubtext: 'text-sm text-gray-500',
  tasksContainer: 'p-4',
  tasksTitle: 'mb-3 text-lg font-semibold text-gray-800',
  tasksItem: 'bg-green-50 mb-2 flex-row items-center rounded-lg p-3',
  tasksItemText: 'text-base font-medium text-gray-800',
  tasksItemSubtext: 'text-sm text-gray-500',
};
