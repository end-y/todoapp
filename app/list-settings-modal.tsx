import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useListStore } from '@/stores/listStore';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useDeleteListById } from '@/query-management/list';
import { getHTMLContent } from './utils';
const ListSettingsModal = () => {
  const navigation = useNavigation();
  const deleteListMutation = useDeleteListById();
  const [currentView, setCurrentView] = useState<'main' | 'sort'>('main');
  const { tasks, listRef, sortTasks, setTasks } = useListStore.getState();
  const isDefaultList = Array.from(new Set(tasks.map((task) => task.list_id))).length > 1;
  // Store'dan liste bilgilerini al

  const handleRenameList = useCallback(() => {
    if (listRef.current) {
      setTimeout(() => {
        router.back();
      }, 0);
      listRef.current.focus();
    }
  }, [listRef]);

  const handlePrintList = async () => {
    try {
      const listTasks = tasks;

      if (listTasks.length === 0) {
        Alert.alert('Uyarı', 'Yazdırılacak görev bulunamadı.');
        return;
      }

      // HTML içeriği oluştur
      const currentDate = new Date().toLocaleDateString('tr-TR');
      const completedTasks = listTasks.filter((task) => task.is_completed);
      const pendingTasks = listTasks.filter((task) => !task.is_completed);

      const html = getHTMLContent(listTasks, currentDate, completedTasks, pendingTasks);

      try {
        const { uri } = await Print.printToFileAsync({
          html,
          width: 612,
          height: 792,
        });
        shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } catch (error) {
        Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Yazdırma özelliği kullanılamıyor.');
    }
  };

  const handleCopyList = async () => {
    const listTasks = tasks;
    let listText = '';
    if (listTasks.length === 0) {
      listText += '• Henüz görev eklenmemiş';
    } else {
      listTasks.forEach((task) => {
        const icon = task.is_completed ? '✅' : '⭕';
        listText += `${icon} ${task.name}\n`;
      });
    }

    try {
      await Clipboard.setStringAsync(listText);
      Alert.alert('Başarılı', 'Liste panoya kopyalandı!');
    } catch (error) {
      Alert.alert('Hata', 'Liste kopyalanırken bir hata oluştu.');
    }
  };

  const handleDeleteList = () => {
    Alert.alert('Listeyi Sil', `Listeyi silmek istediğinizden emin misiniz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          if (tasks.length > 0) {
            try {
              Alert.alert('Başarılı', 'Liste silindi.', [
                {
                  text: 'Tamam',
                  onPress: () => {
                    router.back();
                    deleteListMutation.mutate(tasks[0].list_id);
                    // Listeyi sildikten sonra geri git
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    }
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Hata', 'Liste silinirken bir hata oluştu.');
            }
          }
        },
      },
    ]);
  };

  const handleSort = () => {
    // Sıralama sayfasına geç
    setCurrentView('sort');
  };

  const handleBackToMain = () => {
    // Ana sayfaya dön
    setCurrentView('main');
  };

  const handleSortByPriority = () => {
    sortTasks('priority');
    router.back();
  };

  const handleSortByAlphabetical = () => {
    sortTasks('alphabetical');
    router.back();
  };

  const handleSortByDueDate = () => {
    sortTasks('dueDate');
    router.back();
  };

  const handleSortByCreationDate = () => {
    sortTasks('creationDate');
    router.back();
  };

  const sortItems = [
    { icon: 'flame-outline', text: 'Önem Derecesi', onPress: handleSortByPriority },
    { icon: 'text-outline', text: 'Alfabetik', onPress: handleSortByAlphabetical },
    { icon: 'calendar-outline', text: 'Son Tarih', onPress: handleSortByDueDate },
    { icon: 'time-outline', text: 'Oluşturma Tarihi', onPress: handleSortByCreationDate },
  ];

  const menuItems = isDefaultList
    ? [
        { icon: 'print-outline', text: 'Listeyi Yazdır', onPress: handlePrintList },
        { icon: 'copy-outline', text: 'Kopya Gönder', onPress: handleCopyList },
        { icon: 'swap-vertical-outline', text: 'Sırala', onPress: handleSort },
      ]
    : [
        { icon: 'create-outline', text: 'Listeyi yeniden adlandır', onPress: handleRenameList },
        { icon: 'print-outline', text: 'Listeyi Yazdır', onPress: handlePrintList },
        { icon: 'copy-outline', text: 'Kopya Gönder', onPress: handleCopyList },
        { icon: 'trash-outline', text: 'Listeyi sil', onPress: handleDeleteList },
        { icon: 'swap-vertical-outline', text: 'Sırala', onPress: handleSort },
      ];

  const renderHeader = useCallback(() => {
    if (currentView === 'sort') {
      return (
        <View className={styles.header}>
          <TouchableOpacity onPress={handleBackToMain} className={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
            <Text className={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
          <Text className={styles.headerTitle}>Liste Ayarları › Sırala</Text>
          <View className={styles.placeholder} />
        </View>
      );
    }

    return (
      <View className={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} className={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text className={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        <Text className={styles.headerTitle}>Liste Ayarları</Text>
        <View className={styles.placeholder} />
      </View>
    );
  }, [currentView]);

  const renderContent = useCallback(() => {
    if (currentView === 'sort') {
      return (
        <View className={styles.content}>
          <Text className={styles.menuTitle}>Sıralama Ölçütleri</Text>

          {sortItems.map((item, index) => (
            <TouchableOpacity key={index} className={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#333" />
              <Text className={styles.menuItemText}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <View className={styles.content}>
        <Text className={styles.menuTitle}>Liste Ayarları</Text>

        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} className={styles.menuItem} onPress={item.onPress}>
            <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#333" />
            <Text className={styles.menuItemText}>{item.text}</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [currentView]);

  return (
    <SafeAreaView className={styles.container}>
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = {
  container: 'h-1/2 bg-white absolute bottom-0 left-0 right-0 rounded-t-3xl',
  header: 'flex-row items-center justify-between px-4 py-3 border-b border-gray-200',
  backButton: 'flex-row items-center flex-1',
  backButtonText: 'text-base text-gray-500 ml-2',
  headerTitle: 'text-lg font-semibold text-gray-800',
  placeholder: 'flex-1',
  content: 'flex-1 bg-white p-4',
  menuTitle: 'text-sm font-semibold text-gray-600 uppercase mb-2 px-4',
  menuItem: 'flex-row items-center py-2 px-4 mb-1',
  menuItemText: 'text-base text-gray-800 ml-4 flex-1',
  divider: 'h-px bg-gray-200 my-4 mx-4',
};

export default ListSettingsModal;
