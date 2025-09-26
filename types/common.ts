// Ortak utility types ve global declarations

// Global type declarations
declare global {
  var datePickerCallback: ((date: string) => void) | undefined;
}

// Ortak utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Form types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

