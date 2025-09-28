import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'react-native';
import AnimatedCheckbox from './AnimatedCheckbox';
import React, { useState } from 'react';

const TaskItem = ({ task, onToggleComplete, color }: any) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const handlePress = () => {
    router.push(`/task/task-detail?id=${task.id}&listId=${task.list_id}&color=${color}`);
  };

  const toggleImageExpansion = (e: any) => {
    e.stopPropagation(); // Prevent task detail navigation
    setIsImageExpanded(!isImageExpanded);
  };

  return (
    <View className={styles.taskContainer}>
      <TouchableOpacity className={styles.taskItem} onPress={handlePress}>
        <AnimatedCheckbox checked={task.is_completed} onToggle={() => onToggleComplete(task)} />
        <View className={styles.taskContent}>
          <Text className={styles.taskText}>{task.name}</Text>
        </View>
        <Text className={styles.taskStatus}>{task.status}</Text>
      </TouchableOpacity>
      {task.image && (
        <View className={styles.imageSection}>
          <TouchableOpacity onPress={toggleImageExpansion} activeOpacity={0.8}>
            <Image
              source={{ uri: task.image }}
              className={isImageExpanded ? styles.taskImageExpanded : styles.taskImageCollapsed}
              resizeMode="cover"
            />
            <View className={styles.expandButton}>
              <Text className={styles.expandButtonText}>
                {isImageExpanded ? '↑ Küçült' : '↓ Genişlet'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = {
  taskContainer: 'mb-2',
  taskItem: 'bg-white/10 rounded-t-lg p-3 flex-row items-center gap-3',
  taskContent: 'flex-1 flex-row items-center gap-2',
  taskText: 'text-textPrimary text-base font-medium flex-1',
  taskStatus: 'text-white/70 text-sm capitalize',
  imageSection: 'p-2 bg-white/5 rounded-b-lg overflow-hidden',
  taskImageCollapsed: 'w-full h-20 opacity-70',
  taskImageExpanded: 'w-full h-48',
  expandButton: 'absolute bottom-0 left-0 right-0 bg-black/50 p-2',
  expandButtonText: 'text-white text-center text-sm font-medium',
};

export default TaskItem;
