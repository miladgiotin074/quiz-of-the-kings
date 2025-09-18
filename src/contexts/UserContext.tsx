'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserContextType, TelegramUser } from '@/types/user';
import { userService } from '@/services/userService';

// User state type
interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Add retry functionality
type RetryFunction = () => void;

// Action types
type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'LOGOUT' };

// Initial state
const initialState: UserState = {
  user: null,
  isLoading: true,
  error: null,
};

// Reducer function
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, error: null };
    default:
      return state;
  }
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Login function
  const login = async (telegramUser: TelegramUser): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const result = await userService.findOrCreateUser(telegramUser);
      dispatch({ type: 'SET_USER', payload: result.user });
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(result.user));
      
      if (result.isNewUser) {
        console.log('New user created:', result.user.firstName);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Login failed:', error);
    }
  };

  // Logout function
  const logout = (): void => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
  };

  // Update user function
  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await userService.updateUser({
        userId: state.user._id,
        updates,
      });
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Add coins function
  const addCoins = async (amount: number): Promise<void> => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await userService.addCoins({
        userId: state.user._id,
        amount,
      });
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add coins';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Add XP function
  const addXP = async (amount: number): Promise<void> => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await userService.addXP({
        userId: state.user._id,
        amount,
      });
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add XP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Add score function
  const addScore = async (amount: number): Promise<void> => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await userService.addScore({
        userId: state.user._id,
        amount,
      });
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add score';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Initialize user from localStorage or wait for Root to set user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Try to load user from localStorage first
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          dispatch({ type: 'SET_USER', payload: parsedUser });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // If no saved user, wait for Root to authenticate and set user
        console.log('UserContext initialized - waiting for Root to set user');
      } catch (error) {
        console.error('❌ Failed to initialize user:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeUser();
  }, []);

  // Retry function to reinitialize user
  const retry = (): void => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Try to reload from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: parsedUser });
        console.log('✅ User reloaded from localStorage:', parsedUser);
      } catch (error) {
        console.error('❌ Failed to parse saved user:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved user data' });
      }
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'No user data available' });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const contextValue: UserContextType = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    updateUser,
    addCoins,
    addXP,
    addScore,
    retry,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;