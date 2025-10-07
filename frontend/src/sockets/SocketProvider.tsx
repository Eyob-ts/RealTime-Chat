import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (token && user) {
      let newSocket: Socket;
      try {
        newSocket = io(`${backend}/chat`, {
          auth: {
            token: token,
          },
          // allow polling fallback for environments where websocket fails
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
      } catch (e) {
        console.warn('Socket init failed', (e as any)?.message || e);
        return;
      }

      newSocket.on('connect', () => {
        console.log('Socket connected', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection error', err);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // when server notifies user that they were added to a room, dispatch a DOM event
      newSocket.on('addedToRoom', (payload: any) => {
        try {
          const ev = new CustomEvent('addedToRoom', { detail: payload });
          window.dispatchEvent(ev);
        } catch (e) {
          console.warn('Failed to dispatch addedToRoom event', e);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token, user, backend]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const s = useContext(SocketContext);
  if (!s) throw new Error('useSocket must be used inside SocketProvider');
  return s;
};
