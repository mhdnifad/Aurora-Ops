'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';
import { useOrganization } from './organization-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useOrganization();
  const socketRef = React.useRef<Socket | null>(null);
  const isAuthenticatedRef = React.useRef(isAuthenticated);

  // Update ref when auth changes
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const orgId = currentOrganization?._id;

    // If not authenticated or no org context, disconnect
    if (!isAuthenticated || !orgId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // If socket already exists for this org and is connected, keep it
    const activeOrgId = (socketRef.current as any)?.io?.opts?.auth?.organizationId;
    if (socketRef.current?.connected && activeOrgId === orgId) {
      return;
    }

    // Tear down existing socket if org changed
    if (socketRef.current && activeOrgId !== orgId) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }


    // Get token from auth_tokens object stored in localStorage
    let accessToken = '';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_tokens');
      if (stored) {
        try {
          const tokens = JSON.parse(stored);
          accessToken = tokens.accessToken;
        } catch (e) {
          // Silent fail
        }
      }
    }

    // Only create socket if we have a valid token
    if (!accessToken) {
      return;
    }

    // Use explicit socket URL for Nginx proxy (http://localhost/socket.io)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost';
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: {
        token: accessToken,
        organizationId: orgId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      // Socket error - silently handle
    });

    newSocket.on('connect_error', (error) => {
      // Connection error - silently handle
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, currentOrganization]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Hook for listening to specific events
export function useSocketEvent(event: string, handler: (data: any) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}
