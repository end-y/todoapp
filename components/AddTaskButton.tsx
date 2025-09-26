import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  KeyboardEventName,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddTaskButtonProps } from '@/types';
import DatePickerInput from './DatePickerInput';
import { Divider } from './Divider';

const AddTaskButton = ({ onAddTask, backgroundColor }: AddTaskButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { bottom } = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showEvent = Platform.select({
      ios: 'keyboardWillShow',
      android: 'keyboardDidShow',
    });

    const keyboardWillShow = Keyboard.addListener(showEvent as KeyboardEventName, (e) => {
      setKeyboardHeight(e.endCoordinates.height + 20);
    });

    return () => {
      keyboardWillShow.remove();
    };
  }, []);

  const handlePress = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = () => {
    if (taskName.trim()) {
      onAddTask(taskName.trim(), description.trim() || undefined, dueDate || undefined);
      setTaskName('');
      setDescription('');
      setDueDate('');
      setShowDetails(false);
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleCancel = () => {
    setTaskName('');
    setDescription('');
    setDueDate('');
    setShowDetails(false);
    setIsExpanded(false);
    inputRef.current?.blur();
    setKeyboardHeight(0);
    Keyboard.dismiss();
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (isExpanded) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          position: 'absolute',
          bottom: keyboardHeight > 0 ? keyboardHeight : bottom + 20,
          left: 16,
          right: 16,
          maxHeight: '80%',
        }}>
        <View className={styles.expandedContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Görev Adı */}
            <View className={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="Görev ekle..."
                className={styles.textInput}
                onSubmitEditing={showDetails ? undefined : handleSubmit}
                returnKeyType={showDetails ? 'next' : 'done'}
                blurOnSubmit={false}
                multiline={false}
              />
            </View>

            {/* Detay Alanları */}
            {showDetails && (
              <View
                className={styles.detailsContainer}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(event) => event.stopPropagation()}>
                {/* Açıklama */}
                <View className={styles.fieldContainer}>
                  <Text className={styles.fieldLabel}>Açıklama</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Görev açıklaması..."
                    className={styles.descriptionInput}
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Tarih */}
                <View className={styles.fieldContainer}>
                  <DatePickerInput
                    value={dueDate}
                    onDateChange={setDueDate}
                    placeholder="Tarih seçin"
                    label="Son Tarih"
                    className=""
                  />
                </View>
              </View>
            )}
          </ScrollView>
          <Divider />
          {/* Alt Butonlar */}
          <View className={styles.buttonGroup}>
            <TouchableOpacity onPress={toggleDetails} className={styles.detailButton}>
              <Ionicons name={showDetails ? 'chevron-up' : 'chevron-down'} size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} className={styles.cancelButton}>
              <Ionicons name="close" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} className={styles.submitButton}>
              <Ionicons name="checkmark" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: bottom + 20,
        right: 20,
        transform: [{ scale: scaleAnim }],
      }}>
      <TouchableOpacity
        onPress={handlePress}
        className={[styles.floatingButton, backgroundColor].join(' ')}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = {
  floatingButton: 'w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5',
  expandedContainer: 'bg-white rounded-lg p-4 shadow-lg elevation-8',
  inputContainer: 'mb-3',
  textInput: 'text-base px-3 py-3 bg-gray-50 rounded-lg min-h-12',
  detailButton: 'flex-1 flex-row  py-2 bg-transparent w-8 h-8 self-start',
  detailsContainer: 'mb-3',
  fieldContainer: 'mb-4',
  fieldLabel: 'text-xl font-semibold text-gray-700 mb-2',
  descriptionInput: 'text-base px-3 py-3 bg-gray-50 rounded-lg min-h-20',
  buttonGroup: 'flex-row justify-end mt-2 pt-3 border-gray-200',
  cancelButton: 'w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3',
  submitButton: 'w-10 h-10 bg-green-100 rounded-full items-center justify-center',
};

export default AddTaskButton;
