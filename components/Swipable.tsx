import React from 'react';
import { Animated, PanResponder, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipableButtonProps } from '@/types';

export default function Swipable({ children, onDelete, onEdit }: SwipableButtonProps) {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const threshold = 100; // swipe distance to trigger reveal

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        // allow horizontal dragging both ways (edit left, delete right)
        if (onEdit) {
          translateX.setValue(Math.max(Math.min(gestureState.dx, 70), -70));
        } else {
          translateX.setValue(Math.max(Math.min(gestureState.dx, 0), -70));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -threshold) {
          // reveal delete button and keep it visible (swipe left)
          Animated.timing(translateX, {
            toValue: -70,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dx > threshold && onEdit) {
          // reveal edit button and keep it visible (swipe right)
          Animated.timing(translateX, {
            toValue: 70,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          // reset position
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleDeletePress = () => {
    Alert.alert('Emin misiniz?', 'Bu öğeyi silmek istediğinizden emin misiniz?', [
      {
        text: 'Hayır',
        style: 'cancel',
        onPress: () => {
          // Reset position when cancelled
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      },
      {
        text: 'Evet',
        style: 'destructive',
        onPress: onDelete,
      },
    ]);
  };

  return (
    <View className={styles.container}>
      {/* Hidden edit background (left side) */}
      {onEdit && (
        <View className={styles.editBackground}>
          <TouchableOpacity onPress={onEdit} className={styles.editButton}>
            <Ionicons name="pencil" size={20} color="white" />
            <Text className={styles.editText}>Düzenle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hidden delete background (right side) */}
      <View className={styles.deleteBackground}>
        <TouchableOpacity onPress={handleDeletePress} className={styles.deleteButton}>
          <Ionicons name="trash" size={20} className={styles.deleteIcon} color="white" />
          <Text className={styles.deleteText}>Sil</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        className={styles.content}
        style={{ transform: [{ translateX: translateX }] }}
        {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = {
  container: 'relative overflow-hidden',
  editBackground: 'absolute left-0 top-0 bottom-0 w-20 bg-blue-500 items-center justify-center',
  editButton: 'flex-1 items-center justify-center flex-row gap-1 px-2',
  editText: 'text-white font-semibold text-xs',
  deleteBackground: 'absolute right-0 top-0 bottom-0 w-20 bg-red-500 items-center justify-center',
  deleteButton: 'flex-1 items-center justify-center flex-row gap-1 px-2',
  deleteIcon: 'text-white',
  deleteText: 'text-white font-semibold text-xs',
  content: 'bg-background',
};
