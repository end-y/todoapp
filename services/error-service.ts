// Merkezi Error Handling Servisi
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AppError, ErrorType, ErrorSeverity, ErrorHandlingOptions } from '@/types/errors';

class ErrorService {
  private static instance: ErrorService;
  private errors: AppError[] = [];
  private listeners: Array<(error: AppError) => void> = [];

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  // Error oluşturma helper'ı
  createError(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    source?: string,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      source,
      originalError,
      context,
    };
  }

  // Ana error handling metodu
  handleError(error: AppError | Error | string, options: ErrorHandlingOptions = {}): AppError {
    let appError: AppError;

    // Error tipini standardize et
    if (typeof error === 'string') {
      appError = this.createError(error);
    } else if (error instanceof Error) {
      appError = this.createError(
        error.message,
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        undefined,
        error
      );
    } else {
      appError = error;
    }

    // Error'ı kaydet
    this.addError(appError);

    // Default options
    const {
      showToast = true,
      showModal = false,
      logError = true,
      navigateToErrorPage = false,
      retryable = false,
    } = options;

    // Error'ı işle
    if (logError) {
      this.logError(appError);
    }

    if (showToast) {
      this.showToast(appError);
    }

    if (showModal) {
      this.showModal(appError);
    }

    if (navigateToErrorPage) {
      this.navigateToErrorPage(appError);
    }

    // Listeners'ı bilgilendir
    this.notifyListeners(appError);

    return appError;
  }

  // React Query error'larını handle et
  handleQueryError(error: any, source?: string): AppError {
    const errorMessage = error?.message || 'Bilinmeyen bir hata oluştu';
    const errorType = this.determineErrorType(error);
    const severity = this.determineSeverity(errorType, error);

    const appError = this.createError(errorMessage, errorType, severity, source, error);

    // Recursive call'ı önlemek için direkt işlemleri yap
    this.addError(appError);
    this.logError(appError);
    this.showToast(appError);

    if (severity === ErrorSeverity.CRITICAL) {
      this.navigateToErrorPage(appError);
    }

    this.notifyListeners(appError);

    return appError;
  }

  // Network error'larını handle et
  handleNetworkError(error: any, source?: string): AppError {
    const appError = this.createError(
      'İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.',
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      source,
      error
    );

    this.addError(appError);
    this.logError(appError);
    this.showToast(appError);
    this.notifyListeners(appError);

    return appError;
  }

  // Validation error'larını handle et
  handleValidationError(message: string, source?: string): AppError {
    const appError = this.createError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, source);

    this.addError(appError);
    this.showToast(appError);
    this.notifyListeners(appError);

    return appError;
  }

  private addError(error: AppError): void {
    this.errors.push(error);
    // Son 50 error'ı tut
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.type}] ${error.message}`;
    const logDetails = {
      id: error.id,
      source: error.source,
      timestamp: error.timestamp,
      context: error.context,
      originalError: error.originalError,
    };

    switch (logLevel) {
      case 'error':
        console.error(logMessage, logDetails);
        break;
      case 'warn':
        console.warn(logMessage, logDetails);
        break;
      case 'info':
        console.info(logMessage, logDetails);
        break;
      default:
        console.log(logMessage, logDetails);
    }
  }

  private showToast(error: AppError): void {
    const toastType = error.severity === ErrorSeverity.LOW ? 'info' : 'error';

    Toast.show({
      type: toastType,
      text1: this.getToastTitle(error.type),
      text2: error.message,
      visibilityTime: this.getToastDuration(error.severity),
    });
  }

  private showModal(error: AppError): void {
    // Modal gösterme logic'i burada olacak
    // Şimdilik Toast ile handle ediyoruz
    this.showToast(error);
  }

  private navigateToErrorPage(error: AppError): void {
    router.push({
      pathname: '/error',
      params: {
        title: this.getErrorTitle(error.type),
        message: error.message,
        errorId: error.id,
      },
    });
  }

  private determineErrorType(error: any): ErrorType {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
      return ErrorType.NETWORK;
    }
    if (error?.code === 'VALIDATION_ERROR') {
      return ErrorType.VALIDATION;
    }
    if (error?.code === 'DATABASE_ERROR' || error?.message?.includes('database')) {
      return ErrorType.DATABASE;
    }
    return ErrorType.UNKNOWN;
  }

  private determineSeverity(type: ErrorType, error: any): ErrorSeverity {
    switch (type) {
      case ErrorType.NETWORK:
        return ErrorSeverity.HIGH;
      case ErrorType.DATABASE:
        return ErrorSeverity.CRITICAL;
      case ErrorType.VALIDATION:
        return ErrorSeverity.LOW;
      case ErrorType.AUTHENTICATION:
        return ErrorSeverity.HIGH;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'error';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'log';
    }
  }

  private getToastTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Bağlantı Hatası';
      case ErrorType.DATABASE:
        return 'Veri Hatası';
      case ErrorType.VALIDATION:
        return 'Geçersiz Veri';
      case ErrorType.AUTHENTICATION:
        return 'Kimlik Doğrulama Hatası';
      default:
        return 'Hata';
    }
  }

  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'İnternet Bağlantısı Sorunu';
      case ErrorType.DATABASE:
        return 'Veri Tabanı Hatası';
      case ErrorType.VALIDATION:
        return 'Geçersiz Bilgi';
      case ErrorType.AUTHENTICATION:
        return 'Giriş Hatası';
      default:
        return 'Beklenmeyen Hata';
    }
  }

  private getToastDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 8000;
      case ErrorSeverity.HIGH:
        return 6000;
      case ErrorSeverity.MEDIUM:
        return 4000;
      case ErrorSeverity.LOW:
        return 3000;
      default:
        return 4000;
    }
  }

  private notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  // Public utility methods
  addListener(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    // Cleanup function döndür
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  getErrorById(id: string): AppError | undefined {
    return this.errors.find((error) => error.id === id);
  }

  clearErrors(): void {
    this.errors = [];
  }

  removeError(id: string): void {
    this.errors = this.errors.filter((error) => error.id !== id);
  }
}

// Singleton instance export
export const errorService = ErrorService.getInstance();

// Convenience functions
export const handleError = (error: AppError | Error | string, options?: ErrorHandlingOptions) => {
  return errorService.handleError(error, options);
};

export const handleQueryError = (error: any, source?: string) => {
  return errorService.handleQueryError(error, source);
};

export const handleNetworkError = (error: any, source?: string) => {
  return errorService.handleNetworkError(error, source);
};

export const handleValidationError = (message: string, source?: string) => {
  return errorService.handleValidationError(message, source);
};
