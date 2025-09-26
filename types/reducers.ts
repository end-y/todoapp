import { Task } from './entities';

// Task Reducer Types
export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

export interface TaskAction {
  type:
    | 'SET_TASKS'
    | 'ADD_TASK'
    | 'UPDATE_TASK'
    | 'DELETE_TASK'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'SET_SELECTED_TASK'
    | 'CLEAR_TASKS';
  payload?: any;
}

// List Reducer Types
export interface ListState {
  id: number | null;
  name: string;
  isLoading: boolean;
  error: string | null;
}

export interface ListAction {
  type: 'SET_LIST_ID' | 'UPDATE_LIST_NAME' | 'SET_LOADING' | 'SET_ERROR' | 'RESET_LIST';
  payload?: any;
}

