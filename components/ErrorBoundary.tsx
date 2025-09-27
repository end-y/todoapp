import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { errorService } from '@/services/error-service';
import { ErrorType, ErrorSeverity } from '@/types/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error'ı merkezi servise gönder
    const appError = errorService.createError(
      error.message,
      ErrorType.UNKNOWN,
      ErrorSeverity.CRITICAL,
      'ErrorBoundary',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      }
    );

    const handledError = errorService.handleError(appError, {
      showToast: false,
      logError: true,
      navigateToErrorPage: false,
    });

    this.setState({ errorId: handledError.id });

    // Prop olarak gelen onError callback'ini çağır
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
    router.replace('/');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback varsa onu kullan
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      // Default error UI
      return (
        <View className="flex-1 items-center justify-center bg-red-50 p-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
            {/* Error Icon */}
            <View className="mb-6 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="alert-circle" size={32} color="#EF4444" />
              </View>
              <Text className="mb-2 text-center text-xl font-bold text-gray-800">
                Beklenmeyen Hata
              </Text>
              <Text className="text-center text-sm leading-5 text-gray-600">
                Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen tekrar deneyin.
              </Text>
            </View>

            {/* Error Details (Development only) */}
            {__DEV__ && this.state.error && (
              <View className="mb-6 rounded-lg bg-gray-100 p-3">
                <Text className="font-mono text-xs text-gray-700">{this.state.error.message}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={this.handleRetry}
                className="items-center rounded-lg bg-red-500 py-4">
                <Text className="text-base font-semibold text-white">Tekrar Dene</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleGoHome}
                className="items-center rounded-lg bg-gray-200 py-4">
                <Text className="text-base font-semibold text-gray-700">Ana Sayfaya Dön</Text>
              </TouchableOpacity>
            </View>

            {/* Error ID (for support) */}
            {this.state.errorId && (
              <View className="mt-4 border-t border-gray-200 pt-4">
                <Text className="text-center text-xs text-gray-500">
                  Destek İçin Hata Kodu: {this.state.errorId.slice(-12)}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
