import { create } from 'zustand';
import { router } from 'expo-router';
import { NotificationType, NotificationState } from '@/types';

export const useNotificationStore = create<NotificationState>(() => ({
  showNotification: (message, type = 'info') => {
    if (type === 'error') {
      // Hata durumunda error sayfasına yönlendir
      router.push({
        pathname: '/error',
        params: {
          title: 'Bir Hata Oluştu',
          message: message,
        },
      });
    } else {
      // Diğer tipler için basit console log (Toast kaldırıldı)
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  },
}));
