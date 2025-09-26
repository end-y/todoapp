import '../global.css';

import { Stack } from 'expo-router';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import GlobalLoadingIndicator from '@/components/GlobalLoadingIndicator';
import DatabaseProvider from '@/providers/database-provider';
import Header from '@/components/Header';
import PageHeader from '@/components/PageHeader';
import MainNavigation from '@/navigations/main-navigations';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <MainNavigation />
        <GlobalLoadingIndicator />
        <Toast />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
