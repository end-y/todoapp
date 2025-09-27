import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

import migrations from '../drizzle/migrations';

import { DATABASE_NAME, db } from '@/db';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { DatabaseProviderProps } from '@/types';
import { handleQueryError } from '@/services/error-service';

const queryCache = new QueryCache({
  onError: (error, query) => {
    handleQueryError(error, `Query: ${query.queryKey.join('/')}`);
  },
});

const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    handleQueryError(error, `Mutation: ${mutation.options.mutationKey?.join('/') || 'unknown'}`);
  },
});

const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Network error'larda 3 kez dene
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          return failureCount < 3;
        }
        // Database error'larda deneme
        if (error?.message?.includes('database') || error?.message?.includes('sqlite')) {
          return false;
        }
        // Diğer error'larda 1 kez dene
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Mutation'larda sadece network error'larda tekrar dene
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          return failureCount < 2;
        }
        return false;
      },
    },
  },
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
