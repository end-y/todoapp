import React, { useCallback } from 'react';
import { FlatList, FlatListProps, Platform } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  itemHeight?: number;
  gap?: number;
  enablePlatformOptimization?: boolean;
}

function OptimizedFlatList<T>({
  renderItem,
  itemHeight = 60,
  gap = 0,
  enablePlatformOptimization = true,
  ...restProps
}: OptimizedFlatListProps<T>) {
  const optimizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem({ item, index }),
    [renderItem]
  );

  const getItemLayout = useCallback(
    (data: ArrayLike<T> | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index + gap * index,
      index,
    }),
    [itemHeight, gap]
  );

  return (
    <FlatList
      {...restProps}
      renderItem={optimizedRenderItem}
      // Performance Optimizations
      removeClippedSubviews={enablePlatformOptimization ? Platform.OS === 'android' : false}
      maxToRenderPerBatch={enablePlatformOptimization ? (Platform.OS === 'android' ? 15 : 10) : 10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={enablePlatformOptimization ? (Platform.OS === 'android' ? 12 : 8) : 8}
      windowSize={21}
      getItemLayout={getItemLayout}
      showsVerticalScrollIndicator={false}
      // Optimize re-renders
      keyExtractor={(item, index) => {
        // Try to use item's unique identifier first
        if (typeof item === 'object' && item !== null && 'id' in item) {
          return String((item as any).id);
        }
        return String(index);
      }}
    />
  );
}

export default OptimizedFlatList;
