import { Ionicons } from '@expo/vector-icons';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { cssInterop } from 'nativewind';
import { forwardRef, ComponentType, useCallback } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

export type ButtonProps = any;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, icon, iconColor = 'black', count, ...touchableProps }, ref) => {
    const StyledIcon = cssInterop(Ionicons, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
        },
      },
    });
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        className={`${styles.button} ${touchableProps.className}`}>
        <View className={styles.buttonContent}>
          {icon && (
            <StyledIcon
              size={24}
              className={iconColor}
              name={icon as keyof typeof Ionicons.glyphMap}
            />
          )}
          <Text className={styles.buttonText}>{title}</Text>
        </View>
        {!['0', 0, undefined].includes(count) && <Text className={styles.countText}>{count}</Text>}
      </TouchableOpacity>
    );
  }
);

const styles = {
  button: 'flex-row items-center justify-between',
  buttonContent: 'flex-row items-center',
  buttonText: 'text-black text-lg font-semibold text-center mx-2 ml-5 text-textPrimary',
  countText: 'text-gray-600 text-sm ml-1 self-center self-end mr-1',
};
