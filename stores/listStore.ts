import { create } from 'zustand';
import { List, Task } from '@/types';
import { TextInput } from 'react-native';

export interface ListState {
  // Aktif liste (modal için)

  // Görevler
  tasks: Task[];
  listRef: any;
  filter: ((task: Task) => boolean) | null;
  setFilter: (filter: ((task: Task) => boolean) | null) => void;
  setListRef: (listRef: React.RefObject<TextInput>) => void;
  // Actions - sadece modal için gerekli olanlar
  setTasks: (tasks: Task[]) => void;
  sortTasks: (sortBy: 'priority' | 'alphabetical' | 'dueDate' | 'creationDate') => void;
}

export const useListStore = create<ListState>((set, get) => ({
  // Initial state
  tasks: [],
  listRef: null,
  filter: null,
  setFilter: (filter: ((task: Task) => boolean) | null) => {
    set({ filter });
  },
  setTasks: (tasks: Task[]) => {
    set({ tasks });
  },
  setListRef: (listRef: React.RefObject<TextInput>) => {
    set({ listRef });
  },
  sortTasks: (sortBy: 'priority' | 'alphabetical' | 'dueDate' | 'creationDate') => {
    set((state) => {
      const sortedTasks = [...state.tasks].sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (
              (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
              (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
            );

          case 'alphabetical':
            return a.name.localeCompare(b.name);

          case 'dueDate':
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();

          case 'creationDate':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

          default:
            return 0;
        }
      });

      return { tasks: sortedTasks };
    });
  },
}));
