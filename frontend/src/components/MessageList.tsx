import React, { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

interface Message {
  id: number | string;
  text: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
  optimistic?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: number;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.user.id === currentUserId}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
