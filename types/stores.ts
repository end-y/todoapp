// Store ve Context Types

// Notification Store Types
export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationState {
  showNotification: (message: string, type?: NotificationType) => void;
}

// Screen Context Types
export interface ScreenContextType {
  listState: any; // TODO: ListState ile değiştir
  listDispatch: any; // TODO: Dispatch<ListAction> ile değiştir
  handleAddTask: (taskName: string) => Promise<void>;
  setCurrentListId: (id: number) => void;
}
