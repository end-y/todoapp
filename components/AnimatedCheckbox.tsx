import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCheckboxProps } from '@/types';

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onToggle,
  size = 24,
  color = '#4ECDC4',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(checked ? 1 : 0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(checked ? 1 : 0.3)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: checked ? 1.1 : 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: checked ? 1 : 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (checked) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [checked]);

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}>
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={size}
          color={checked ? color : '#666'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedCheckbox;
