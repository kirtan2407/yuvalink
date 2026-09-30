import { createContext, useContext, useReducer } from 'react';

const MembersContext = createContext();

const initialState = {
  members: [],
  loading: false,
  error: null,
  filters: {
    group: 'all',
    search: '',
    sort: 'name_asc'
  }
};

function membersReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, members: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

export function MembersProvider({ children }) {
  const [state, dispatch] = useReducer(membersReducer, initialState);

  return (
    <MembersContext.Provider value={{ state, dispatch }}>
      {children}
    </MembersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMembers = () => useContext(MembersContext);
