import Header from '@/components/Header';
import { Stack, router } from 'expo-router';

const MainNavigation = () => {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: 'Listeler',
          header: () => (
            <Header
              name="Ender"
              profileImage="https://placeon.site/200/200/png/235bcd?text=EY&font=opensans&fontSize=24"
              onSearchPress={() => router.push('/search-modal')}
            />
          ),
        }}
      />
      <Stack.Screen
        name="date-picker-modal"
        options={{
          presentation: 'modal',
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="search-modal"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="list-settings-modal"
        options={{
          presentation: 'modal',
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="error"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default MainNavigation;
