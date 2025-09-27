// Error handling için standardize edilmiş tipler

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: Date;
  source?: string; // Hangi component/function'dan geldiği
  originalError?: Error;
  context?: Record<string, any>; // Ek context bilgileri
}

export interface ErrorHandlingOptions {
  showToast?: boolean;
  showModal?: boolean;
  logError?: boolean;
  navigateToErrorPage?: boolean;
  retryable?: boolean;
  onRetry?: () => void;
}

export interface ErrorState {
  errors: AppError[];
  isLoading: boolean;
  lastError: AppError | null;
}

// Error handling için action types
export type ErrorAction =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string } // error id
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; payload: boolean };

// React Query error için standart format
export interface QueryErrorResponse {
  message: string;
  statusCode?: number;
  type?: ErrorType;
  details?: string;
}
