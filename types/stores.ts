// Store ve Context Types

// Notification Store Types
export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationState {
  showNotification: (message: string, type?: NotificationType) => void;
}

// Screen Context Types
export interface ScreenContextType {
  currentListId: number | null;
  listName: string;
  isLoading: boolean;
  error: string | null;
  setCurrentListId: (id: number | null) => void;
  setListName: (name: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handleAddTask: (taskName: string, description?: string, dueDate?: string) => Promise<void>;
}
