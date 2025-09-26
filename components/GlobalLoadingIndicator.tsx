import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { ActivityIndicator, View } from 'react-native';

export default function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <View className={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = {
  container: 'absolute inset-0 z-50 flex items-center justify-center bg-black/60',
};
