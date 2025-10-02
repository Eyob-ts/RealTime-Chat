import { useEffect, useRef, useState } from "react";
import { useSocket } from "../sockets/SocketProvider";
import { fetchMessages, postMessage } from "../services/api";

export function useChat(roomId: number | null, userId: number) {
  const socket = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const pendingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!roomId) return;
    let mounted = true;
    (async () => {
      const data = await fetchMessages(roomId);
      if (!mounted) return;
      setMessages(data.reverse()); // show oldest -> newest
    })();

    const roomName = `room-${roomId}`;
    socket.emit("joinRoom", { chatRoomId: roomId, username: `user-${userId}` });

    const onMessage = (msg: any) => {
      setMessages((s) => {
        // dedupe
        if (s.some(m => m.id === msg.id)) return s;
        return [...s, msg];
      });
    };

    socket.on("message", onMessage);

    return () => {
      mounted = false;
      socket.off("message", onMessage);
    };
  }, [roomId, socket]);

  async function sendMessage(text: string) {
    if (!roomId) return null;
    // optimistic UI: temp id negative
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text,
      userId,
      chatRoomId: roomId,
      createdAt: new Date().toISOString(),
      user: { id: userId, username: "you" },
      optimistic: true,
    };
    setMessages((s) => [...s, optimistic]);
    pendingRef.current[tempId] = true;

    // emit to socket — server will persist and broadcast real message
    socket.emit("sendMessage", { text, userId, chatRoomId: roomId }, (ack: any) => {
      // if server acknowledges with the real message, replace temp entry
      if (ack && ack.id) {
        setMessages((s) => s.map(m => (m.id === tempId ? ack : m)));
        delete pendingRef.current[tempId];
      } else {
        // fallback: try REST save
        postMessage({ text, userId, chatRoomId: roomId }).then(real => {
          setMessages((s) => s.map(m => (m.id === tempId ? real : m)));
          delete pendingRef.current[tempId];
        }).catch(() => {
          setMessages((s) => s.filter(m => m.id !== tempId));
          delete pendingRef.current[tempId];
        });
      }
    });
  }

  return { messages, sendMessage };
}
