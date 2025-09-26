import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import AnimatedCheckbox from '@/components/AnimatedCheckbox';
import DatePickerInput from '@/components/DatePickerInput';
import { useCreateTask, useUpdateTask, useGetTaskById } from '@/query-management/task';
import PageHeader from '@/components/PageHeader';
import { TaskPriorities, TaskStatuses } from '@/types/entities';
import TaskNavigation from '@/navigations/task-navigations';

export default function TaskDetailScreen() {
  const { id, listId, color } = useLocalSearchParams<{
    id?: string;
    listId?: string;
    color?: string;
  }>();

  const isEditMode = !!id && id !== '0';
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const { data: existingTask } = useGetTaskById(isEditMode ? parseInt(id!) : 0);

  const [task, setTask] = useState({
    id: id || '',
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    is_completed: false,
    due_date: '',
    list_id: parseInt(listId || '1'),
  });

  useEffect(() => {
    if (existingTask) {
      setTask({
        id: existingTask.id.toString(),
        name: existingTask.name || '',
        description: existingTask.description || '',
        status: existingTask.status || 'pending',
        priority: existingTask.priority || 'medium',
        is_completed: existingTask.is_completed || false,
        due_date: existingTask.due_date || '',
        list_id: existingTask.list_id || parseInt(listId || '1'),
      });
    }
  }, [existingTask, listId]);

  const handleDateChange = (date: string) => {
    setTask({ ...task, due_date: date });
  };

  const handleSave = () => {
    if (isEditMode) {
      updateTaskMutation.mutate({
        id: parseInt(task.id),
        task: {
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          is_completed: task.is_completed,
          due_date: task.due_date,
          list_id: task.list_id,
        },
      });
    } else {
      createTaskMutation.mutate({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        is_completed: task.is_completed,
        due_date: task.due_date,
        list_id: task.list_id,
      });
    }
    router.back();
  };
  return (
    <View className={styles.container}>
      <ScrollView className={styles.scrollView}>
        <TaskNavigation color={color || 'purple'} isEditMode={isEditMode} handleSave={handleSave} />
        {/* Task Name */}
        <View className={styles.mb4}>
          <Text className={styles.content}>Görev Adı</Text>
          <TextInput
            value={task.name}
            onChangeText={(text) => setTask({ ...task, name: text })}
            className={styles.input}
            placeholder="Görev adını girin..."
            placeholderTextColor="rgba(0,0,0,0.5)"
          />
        </View>

        {/* Description */}
        <View className={styles.mb4}>
          <Text className={styles.content}>Açıklama</Text>
          <TextInput
            value={task.description}
            onChangeText={(text) => setTask({ ...task, description: text })}
            className={styles.input}
            placeholder="Açıklama ekleyin..."
            placeholderTextColor="rgba(0,0,0,0.5)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Completion Status */}
        <View className={styles.checkboxContainer}>
          <AnimatedCheckbox
            checked={task.is_completed}
            onToggle={() => setTask({ ...task, is_completed: !task.is_completed })}
          />
          <Text className={styles.checkboxText}>Tamamlandı</Text>
        </View>

        {/* Priority */}
        <View className={styles.mb4}>
          <Text className={styles.content}>Öncelik</Text>
          <View className={styles.priorityContainer}>
            {[TaskPriorities.LOW, TaskPriorities.MEDIUM, TaskPriorities.HIGH].map((priority) => (
              <TouchableOpacity
                key={priority}
                onPress={() => setTask({ ...task, priority })}
                className={`${styles.priorityButton} ${
                  task.priority === priority
                    ? styles.priorityButtonActive
                    : styles.priorityButtonInactive
                }`}>
                <Text
                  className={`${styles.text} ${task.priority === priority ? 'text-white' : 'text-black'}`}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status */}
        <View className={styles.mb4}>
          <Text className={styles.content}>Durum</Text>
          <View className={styles.priorityContainer}>
            {[TaskStatuses.PENDING, TaskStatuses.IN_PROGRESS, TaskStatuses.COMPLETED].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setTask({ ...task, status })}
                  className={`${styles.priorityButton} ${
                    task.status === status
                      ? styles.priorityButtonActive
                      : styles.priorityButtonInactive
                  }`}>
                  <Text
                    className={`${styles.text} ${task.status === status ? 'text-white' : 'text-black'}`}>
                    {status}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Due Date */}
        <DatePickerInput
          label="Son Tarih"
          value={task.due_date}
          onDateChange={handleDateChange}
          placeholder="Tarih seçin"
          className={styles.mb6}
        />
      </ScrollView>
    </View>
  );
}

const styles = {
  container: 'flex-1 bg-white',
  scrollView: 'flex-1 p-4',
  title: 'text-lg font-semibold text-black',
  input: 'rounded-lg bg-gray-100 p-3 text-base text-black border border-gray-200',
  mb4: 'mb-4',
  mb6: 'mb-6',
  content: 'mb-2 text-lg font-semibold text-black',
  text: 'font-medium capitalize text-black',
  button: 'flex-row items-center justify-center rounded-lg bg-blue-500 p-4',
  checkboxContainer: 'mb-4 flex-row items-center',
  checkboxText: 'ml-3 text-lg font-semibold text-black',
  priorityContainer: 'flex-row gap-2',
  priorityButton: 'rounded-lg px-4 py-2',
  priorityButtonActive: 'bg-blue',
  priorityButtonInactive: 'bg-gray-200',
};
