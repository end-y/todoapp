import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ErrorScreen() {
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const errorMessage = (params.message as string) || 'Bir hata oluştu';
  const errorTitle = (params.title as string) || 'Hata';

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-red-50">
      {/* Header */}
      <View className="bg-red-500 px-6 pb-4 pt-16">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleGoBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Hata</Text>
          <TouchableOpacity onPress={handleGoHome} className="p-2">
            <Ionicons name="home" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-8 items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="alert-circle" size={40} color="#EF4444" />
          </View>

          <Text className="mb-4 text-center text-2xl font-bold text-gray-800">{errorTitle}</Text>

          <Text className="mb-8 text-center text-base leading-6 text-gray-600">{errorMessage}</Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-4 space-y-3">
          <TouchableOpacity
            onPress={handleGoHome}
            className="items-center rounded-lg bg-red-500 px-6 py-4">
            <Text className="text-lg font-semibold text-white">Ana Sayfaya Dön</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoBack}
            className="items-center rounded-lg border border-gray-300 bg-white px-6 py-4">
            <Text className="text-lg font-semibold text-gray-700">Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: bottom }} />
    </View>
  );
}
