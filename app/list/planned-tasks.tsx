import { Divider } from '@/components/Divider';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useListStore } from '@/stores/listStore';
import { Task } from '@/types';
import {
  getTodayString,
  getYesterdayString,
  getTomorrowString,
  getWeekLaterString,
} from '../utils';

const PlannedTasksScreen = () => {
  const { setFilter } = useListStore();
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  const filters = useMemo(
    () => [
      {
        id: 'all',
        label: 'Tümü',
        filterFn: () => true,
      },
      {
        id: 'today',
        label: 'Bugün',
        filterFn: (task: Task) => task.due_date === getTodayString(),
      },
      {
        id: 'yesterday',
        label: 'Dün',
        filterFn: (task: Task) => task.due_date === getYesterdayString(),
      },
      {
        id: 'tomorrow',
        label: 'Yarın',
        filterFn: (task: Task) => task.due_date === getTomorrowString(),
      },
      {
        id: 'overdue',
        label: 'Süresi Geçmiş',
        filterFn: (task: Task) => {
          if (!task.due_date) return false;
          return task.due_date < getTodayString();
        },
      },
      {
        id: 'next_week',
        label: 'Gelecek Hafta',
        filterFn: (task: Task) => {
          if (!task.due_date) return false;
          const today = getTodayString();
          const weekLater = getWeekLaterString();
          return task.due_date > today && task.due_date <= weekLater;
        },
      },
    ],
    []
  );

  useEffect(() => {
    const selectedFilter = filters.find((f) => f.id === selectedFilterId);
    if (selectedFilter) {
      setFilter(selectedFilter.filterFn);
    }
  }, [selectedFilterId]);
  return (
    <View className="flex-1">
      <Text className={styles.text}>Planlanmış Görevler</Text>
      <Divider />

      {/* Filtre Etiketleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName={styles.filterContainer}
        className="py-1">
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            className={[
              styles.filterTag,
              selectedFilterId === filter.id && styles.selectedFilterTag,
            ].join(' ')}
            onPress={() => {
              setSelectedFilterId(filter.id);
            }}>
            <Text
              className={[
                styles.filterText,
                selectedFilterId === filter.id && styles.selectedFilterText,
              ].join(' ')}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default PlannedTasksScreen;

const styles = {
  text: 'text-white text-4xl font-bold',
  filterContainer: 'py-1 ',
  filterTag: 'mr-2 bg-white/10 h-10 rounded-lg p-2 border border-white/30',
  selectedFilterTag: 'bg-blue border-blue',
  filterText: 'text-gray-500 text-sm font-medium',
  selectedFilterText: 'text-white font-bold',
};
