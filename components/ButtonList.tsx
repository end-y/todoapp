import React from 'react';
import { View, ViewProps } from 'react-native';
import { ButtonListProps } from '@/types';

export default function ButtonList({ children, ...viewProps }: ButtonListProps) {
  return (
    <View className={styles.buttonList} {...viewProps}>
      {children}
    </View>
  );
}

const styles = {
  buttonList: 'mx-3 mt-[10px] justify-center gap-2',
};
