import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

import migrations from '../drizzle/migrations';

import { DATABASE_NAME, db } from '@/db';
import { useNotificationStore } from '../stores/notificationStore';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { DatabaseProviderProps } from '@/types';

const queryCache = new QueryCache({
  onError: (error) => {
    useNotificationStore.getState().showNotification(error.message, 'error');
  },
});

const mutationCache = new MutationCache({
  onError: (error) => {
    useNotificationStore.getState().showNotification(error.message, 'error');
  },
});

const queryClient = new QueryClient({
  queryCache,
  mutationCache,
});

export default function DatabaseProvider(props: DatabaseProviderProps) {
  const { success, error } = useMigrations(db, migrations);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense>
          {props.children}
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  );
}
