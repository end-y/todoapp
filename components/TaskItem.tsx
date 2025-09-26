import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import AnimatedCheckbox from './AnimatedCheckbox';
import React from 'react';

const TaskItem = React.memo(({ task, onToggleComplete, color }: any) => {
  const handlePress = () => {
    router.push(`/task/task-detail?id=${task.id}&listId=${task.list_id}&color=${color}`);
  };

  return (
    <TouchableOpacity className={styles.taskItem} onPress={handlePress}>
      <AnimatedCheckbox checked={task.is_completed} onToggle={() => onToggleComplete(task)} />
      <Text className={styles.taskText}>{task.name}</Text>
      <Text className={styles.taskStatus}>{task.status}</Text>
    </TouchableOpacity>
  );
});
const styles = {
  taskItem: 'bg-white/10 rounded-lg p-3 flex-row items-center gap-3',
  taskText: 'text-textPrimary text-base font-medium flex-1',
  taskStatus: 'text-white/70 text-sm capitalize',
};

export default TaskItem;
