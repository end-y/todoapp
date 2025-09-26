import '../global.css';

import { Stack } from 'expo-router';
import { View } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import GlobalLoadingIndicator from '@/components/GlobalLoadingIndicator';
import DatabaseProvider from '@/providers/database-provider';
import Header from '@/components/Header';
import PageHeader from '@/components/PageHeader';
import MainNavigation from '@/navigations/main-navigations';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10B981', backgroundColor: '#D1FAE5', borderRadius: 8 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#065F46',
      }}
      text2Style={{
        fontSize: 14,
        color: '#047857',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#EF4444', backgroundColor: '#FEE2E2', borderRadius: 8 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#991B1B',
      }}
      text2Style={{
        fontSize: 14,
        color: '#DC2626',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
};

export default function Layout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <MainNavigation />
        <GlobalLoadingIndicator />
        <Toast config={toastConfig} position="top" visibilityTime={3000} autoHide={true} />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
