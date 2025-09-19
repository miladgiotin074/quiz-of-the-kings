import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@/contexts/UserContext';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second

export const useSocket = () => {
  const { user } = useUser();
  const isAuthenticated = !!user;
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  });

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || socketRef.current?.connected) {
      return;
    }

    console.log('🔌 Connecting to WebSocket server...');
    setSocketState(prev => ({ ...prev, isConnecting: true, error: null }));

    // Create socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001', {
      auth: {
        userId: user._id,
        username: user.username
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: false // We'll handle reconnection manually
    });

    socketRef.current = socket;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setSocketState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0
      });
      clearReconnectTimeout();
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Connection failed'
      }));
      
      // Attempt reconnection
      attemptReconnect();
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: reason === 'io server disconnect' ? 'Server disconnected' : null
      }));

      // Attempt reconnection if not intentional
      if (reason !== 'io client disconnect') {
        attemptReconnect();
      }
    });

    // Authentication error
    socket.on('auth_error', (error) => {
      console.error('🔐 WebSocket authentication error:', error);
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Authentication failed'
      }));
    });

    // General error handling
    socket.on('error', (error) => {
      console.error('⚠️ WebSocket error:', error);
      setSocketState(prev => ({
        ...prev,
        error: error.message || 'Unknown error'
      }));
    });

  }, [isAuthenticated, user, clearReconnectTimeout]);

  const attemptReconnect = useCallback(() => {
    setSocketState(prev => {
      if (prev.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log('❌ Max reconnection attempts reached');
        return {
          ...prev,
          error: 'Connection failed after multiple attempts'
        };
      }

      const newAttempts = prev.reconnectAttempts + 1;
      const delay = RECONNECT_DELAY * Math.pow(2, newAttempts - 1); // Exponential backoff
      
      console.log(`🔄 Attempting reconnection ${newAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
      
      clearReconnectTimeout();
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      return {
        ...prev,
        reconnectAttempts: newAttempts,
        isConnecting: true
      };
    });
  }, [connect, clearReconnectTimeout]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    clearReconnectTimeout();
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setSocketState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0
    });
  }, [clearReconnectTimeout]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      console.log(`📤 Emitting event: ${event}`, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event - socket not connected:', event);
    }
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Initialize connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [clearReconnectTimeout]);

  return {
    socket: socketRef.current,
    isConnected: socketState.isConnected,
    isConnecting: socketState.isConnecting,
    error: socketState.error,
    reconnectAttempts: socketState.reconnectAttempts,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};