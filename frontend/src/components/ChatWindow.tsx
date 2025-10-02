import React, { useState, useEffect } from "react";
import { useSocket } from "../sockets/SocketProvider";

export function ChatWindow({ roomId, userId }: { roomId: number; userId: number }) {
  const socket = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // connect socket when component mounts
    socket.connect();

    // join room
    socket.emit("joinRoom", { roomId, userId });

    // listen for new messages
    socket.on("message", (msg: any) => {
      setMessages((prev) => [...prev, `${msg.user}: ${msg.text}`]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, roomId, userId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("sendMessage", { roomId, userId, text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-400">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded">{m}</div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
