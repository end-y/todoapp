import { ListState, ListAction } from '@/types';

const initialListState: ListState = {
  id: null,
  name: 'Adsız Başlık',
  isLoading: false,
  error: null,
};

const listElementReducer = (state: ListState, action: ListAction): ListState => {
  switch (action.type) {
    case 'SET_LIST_ID':
      return { ...state, id: action.payload, isLoading: false, error: null };
    case 'UPDATE_LIST_NAME':
      return { ...state, name: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET_LIST':
      return initialListState;
    default:
      return state;
  }
};

export { listElementReducer, initialListState };
