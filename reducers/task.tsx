import { Task, TaskState, TaskAction } from '@/types';

const initialTaskState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false, error: null };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        isLoading: false,
        error: null,
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
        isLoading: false,
        error: null,
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        isLoading: false,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };

    case 'CLEAR_TASKS':
      return { ...state, tasks: [], selectedTask: null };

    default:
      return state;
  }
};

export { taskReducer, initialTaskState };
