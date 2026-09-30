import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiCall } from '../services/api';

const MembersContext = createContext();

const initialState = {
  members: [],
  trashMembers: [],
  loading: false,
  error: null,
};

function membersReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        members: action.payload.members || [],
        trashMembers: action.payload.trashMembers || []
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_MEMBER_OPTIMISTIC':
      return { ...state, members: [action.payload, ...state.members] };
    case 'EDIT_MEMBER_OPTIMISTIC':
      return {
        ...state,
        members: state.members.map(m => m.id === action.payload.id || m._id === action.payload.id ? action.payload : m)
      };
    case 'DELETE_MEMBER_OPTIMISTIC':
      return {
        ...state,
        members: state.members.filter(m => m.id !== action.payload.id && m._id !== action.payload.id),
        trashMembers: [{ ...action.payload, deleted: true, deletedAt: new Date().toISOString() }, ...state.trashMembers]
      };
    case 'RESTORE_MEMBER_OPTIMISTIC':
      return {
        ...state,
        trashMembers: state.trashMembers.filter(m => m.id !== action.payload.id && m._id !== action.payload.id),
        members: [{ ...action.payload, deleted: false }, ...state.members]
      };
    case 'DELETE_PERMANENT_OPTIMISTIC':
      return {
        ...state,
        trashMembers: state.trashMembers.filter(m => m.id !== action.payload.id && m._id !== action.payload.id)
      };
    case 'REVERT_STATE':
      return { ...state, members: action.payload.members, trashMembers: action.payload.trashMembers };
    default:
      return state;
  }
}

export function MembersProvider({ children }) {
  const [state, dispatch] = useReducer(membersReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchMembers = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const [membersRes, trashRes] = await Promise.all([
        apiCall('/api/members', { method: 'GET' }),
        apiCall('/api/members/trash', { method: 'GET' })
      ]);
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { members: membersRes, trashMembers: trashRes } 
      });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }, []);

  // Load ONCE after login
  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated, fetchMembers]);

  // Actions
  const addMember = async (memberData) => {
    const tempId = Date.now().toString();
    const newMember = { ...memberData, id: tempId, updatedAt: new Date().toISOString() };
    const prevMembers = state.members;
    const prevTrash = state.trashMembers;

    dispatch({ type: 'ADD_MEMBER_OPTIMISTIC', payload: newMember });

    try {
      const res = await apiCall('/api/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
      });
      
      // Update the optimistic item with real data from server if needed,
      // here we just re-fetch to ensure data integrity
      fetchMembers();

      return { success: true, duplicateWarning: res.duplicateWarning };
    } catch (err) {
      dispatch({ type: 'REVERT_STATE', payload: { members: prevMembers, trashMembers: prevTrash } });
      throw err;
    }
  };

  const editMember = async (id, updates) => {
    const prevMembers = state.members;
    const prevTrash = state.trashMembers;
    const currentMember = state.members.find(m => m.id === id || m._id === id);
    const updatedMember = { ...currentMember, ...updates, updatedAt: new Date().toISOString() };
    
    dispatch({ type: 'EDIT_MEMBER_OPTIMISTIC', payload: updatedMember });

    try {
      const res = await apiCall(`/api/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      fetchMembers(); // ensure sync

      return { success: true, duplicateWarning: res.duplicateWarning };
    } catch (err) {
      dispatch({ type: 'REVERT_STATE', payload: { members: prevMembers, trashMembers: prevTrash } });
      throw err;
    }
  };

  const deleteMember = async (id) => {
    const prevMembers = state.members;
    const prevTrash = state.trashMembers;
    const currentMember = state.members.find(m => m.id === id || m._id === id);
    if (!currentMember) return;

    dispatch({ type: 'DELETE_MEMBER_OPTIMISTIC', payload: currentMember });

    try {
      await apiCall(`/api/members/${id}`, { method: 'DELETE' });
    } catch (err) {
      dispatch({ type: 'REVERT_STATE', payload: { members: prevMembers, trashMembers: prevTrash } });
      throw err;
    }
  };

  const restoreMember = async (id) => {
    const prevMembers = state.members;
    const prevTrash = state.trashMembers;
    const currentMember = state.trashMembers.find(m => m.id === id || m._id === id);
    if (!currentMember) return;

    dispatch({ type: 'RESTORE_MEMBER_OPTIMISTIC', payload: currentMember });

    try {
      await apiCall(`/api/members/${id}/restore`, { method: 'POST' });
    } catch (err) {
      dispatch({ type: 'REVERT_STATE', payload: { members: prevMembers, trashMembers: prevTrash } });
      throw err;
    }
  };

  const deletePermanent = async (id) => {
    const prevMembers = state.members;
    const prevTrash = state.trashMembers;
    const currentMember = state.trashMembers.find(m => m.id === id || m._id === id);
    if (!currentMember) return;

    dispatch({ type: 'DELETE_PERMANENT_OPTIMISTIC', payload: currentMember });

    try {
      await apiCall(`/api/members/${id}/permanent`, { method: 'DELETE' });
    } catch (err) {
      dispatch({ type: 'REVERT_STATE', payload: { members: prevMembers, trashMembers: prevTrash } });
      throw err;
    }
  };

  return (
    <MembersContext.Provider value={{
      state,
      addMember,
      editMember,
      deleteMember,
      restoreMember,
      deletePermanent
    }}>
      {children}
    </MembersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMembers = () => useContext(MembersContext);
