import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../sockets/SocketProvider';
import { fetchMessages, postMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useChat(roomId: number | null) {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const pendingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!roomId || !user) return;
    let mounted = true;

    (async () => {
      try {
        const data = await fetchMessages(roomId);
        if (!mounted) return;
        setMessages(data); // messages are already ordered by createdAt asc
      } catch (error) {
        if ((error as Error).message.includes('403')) {
          console.warn(
            'Access denied to this room (403). You are not a participant.'
          );
          setMessages([]);
        } else {
          console.error('Failed to fetch messages:', error);
        }
      }
    })();

    // Join the room
    socket.emit('joinRoom', { chatRoomId: roomId });

    const onNewMessage = (msg: any) => {
      setMessages((s) => {
        // dedupe by id
        if (msg?.id && s.some((m) => m.id === msg.id)) return s;
        // also avoid adding if an optimistic message with same text and user exists
        if (
          s.some(
            (m) =>
              m.optimistic && m.text === msg.text && m.user?.id === msg.user?.id
          )
        ) {
          // replace the optimistic with the real one
          return s.map((m) =>
            m.optimistic && m.text === msg.text && m.user?.id === msg.user?.id
              ? msg
              : m
          );
        }
        return [...s, msg];
      });
    };

    const onUserTyping = (data: {
      userId: number;
      username: string;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.username);
        } else {
          newSet.delete(data.username);
        }
        return newSet;
      });
    };

    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);

    return () => {
      mounted = false;
      socket.emit('leaveRoom', { chatRoomId: roomId });
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
    };
  }, [roomId, socket, user]);

  async function sendMessage(text: string) {
    if (!roomId || !user) return null;

    // optimistic UI: temp id negative
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text,
      userId: user.id,
      chatRoomId: roomId,
      createdAt: new Date().toISOString(),
      user: { id: user.id, username: user.username },
      optimistic: true,
    };
    setMessages((s) => [...s, optimistic]);
    pendingRef.current[tempId] = true;

    // emit to socket — server will persist and broadcast real message
    socket.emit('sendMessage', { text, chatRoomId: roomId }, (ack: any) => {
      // if server acknowledges with the real message, replace temp entry
      if (ack && ack.status === 'ok' && ack.message) {
        const real = ack.message;
        setMessages((s) => {
          // if real already exists, remove any optimistic with tempId
          if (s.some((m) => m.id === real.id)) {
            return s.filter((m) => m.id !== tempId);
          }
          // replace the optimistic entry with the real one
          if (s.some((m) => m.id === tempId)) {
            return s.map((m) => (m.id === tempId ? real : m));
          }
          // fallback: append if neither exists
          return [...s, real];
        });
        delete pendingRef.current[tempId];
      } else {
        // fallback: try REST save
        postMessage({ text, chatRoomId: roomId })
          .then((real) => {
            setMessages((s) => s.map((m) => (m.id === tempId ? real : m)));
            delete pendingRef.current[tempId];
          })
          .catch(() => {
            setMessages((s) => s.filter((m) => m.id !== tempId));
            delete pendingRef.current[tempId];
          });
      }
    });
  }

  function sendTyping(isTyping: boolean) {
    if (!roomId) return;
    socket.emit('typing', { chatRoomId: roomId, isTyping });
  }

  return { messages, sendMessage, sendTyping, typingUsers };
}
