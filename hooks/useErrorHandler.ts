import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  errorService,
  handleError,
  handleQueryError,
  handleNetworkError,
  handleValidationError,
} from '@/services/error-service';
import { AppError, ErrorHandlingOptions, ErrorType, ErrorSeverity } from '@/types/errors';

/**
 * Error handling için custom hook
 * Component'lerde tutarlı error handling sağlar
 */
export const useErrorHandler = (componentName?: string) => {
  const componentRef = useRef(componentName);

  // Generic error handler
  const handleAppError = useCallback(
    (error: AppError | Error | string, options?: ErrorHandlingOptions) => {
      // Eğer error bir AppError değilse ve component name varsa, context ekle
      if (componentRef.current && (typeof error === 'string' || error instanceof Error)) {
        // String veya Error'ı AppError'a çevir ve context ekle
        const appError = errorService.createError(
          typeof error === 'string' ? error : error.message,
          ErrorType.UNKNOWN,
          ErrorSeverity.MEDIUM,
          componentRef.current,
          error instanceof Error ? error : undefined
        );
        return handleError(appError, options);
      }
      return handleError(error, options);
    },
    []
  );

  // React Query error handler
  const handleReactQueryError = useCallback((error: any, options?: ErrorHandlingOptions) => {
    const source = componentRef.current ? `${componentRef.current} (React Query)` : 'React Query';
    return handleQueryError(error, source);
  }, []);

  // Network error handler
  const handleNetworkErrorWithContext = useCallback(
    (error: any, options?: ErrorHandlingOptions) => {
      const source = componentRef.current ? `${componentRef.current} (Network)` : 'Network';
      return handleNetworkError(error, source);
    },
    []
  );

  // Validation error handler
  const handleValidationErrorWithContext = useCallback(
    (message: string, options?: ErrorHandlingOptions) => {
      const source = componentRef.current ? `${componentRef.current} (Validation)` : 'Validation';
      return handleValidationError(message, source);
    },
    []
  );

  // Try-catch wrapper
  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>, options?: ErrorHandlingOptions) => {
      return async (...args: T): Promise<R | null> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleAppError(error as Error, options);
          return null;
        }
      };
    },
    [handleAppError]
  );

  // Sync function wrapper
  const withSyncErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => R, options?: ErrorHandlingOptions) => {
      return (...args: T): R | null => {
        try {
          return fn(...args);
        } catch (error) {
          handleAppError(error as Error, options);
          return null;
        }
      };
    },
    [handleAppError]
  );

  return {
    handleError: handleAppError,
    handleQueryError: handleReactQueryError,
    handleNetworkError: handleNetworkErrorWithContext,
    handleValidationError: handleValidationErrorWithContext,
    withErrorHandling,
    withSyncErrorHandling,
  };
};

/**
 * Error listener hook
 * Component'te error'ları dinlemek için kullanılır
 */
export const useErrorListener = (
  onError: (error: AppError) => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const removeListener = errorService.addListener(onError);
    return removeListener;
  }, deps);
};

/**
 * Error state hook
 * Error service'in state'ini component'te kullanmak için
 */
export const useErrorState = () => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [lastError, setLastError] = useState<AppError | null>(null);

  useErrorListener((error) => {
    setErrors((prev) => [...prev, error]);
    setLastError(error);
  });

  const clearErrors = useCallback(() => {
    errorService.clearErrors();
    setErrors([]);
    setLastError(null);
  }, []);

  const removeError = useCallback(
    (id: string) => {
      errorService.removeError(id);
      setErrors((prev) => prev.filter((e) => e.id !== id));
      if (lastError?.id === id) {
        setLastError(null);
      }
    },
    [lastError]
  );

  return {
    errors,
    lastError,
    clearErrors,
    removeError,
  };
};
