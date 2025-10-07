import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAuth } from '../contexts/AuthContext';

export function ChatWindow({ roomId }: { roomId: number }) {
  const { messages, sendMessage, sendTyping, typingUsers } = useChat(roomId);
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // use number | null for browser setTimeout handle (avoids NodeJS types)
  const typingTimeoutRef = useRef<number | null>(null);

  const handleInputChange = (value: string) => {
    setInput(value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current as unknown as number);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current as unknown as number);
    }

    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTyping(false);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="text-white text-lg font-semibold">Room {roomId}</h2>
        {typingUsers.size > 0 && (
          <p className="text-gray-400 text-sm">
            {Array.from(typingUsers).join(', ')}{' '}
            {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </p>
        )}
      </div>

      {/* Messages */}
      {/* Use min-h-0 so the flex child can shrink and allow overflow-y to work */}
      <div className="flex-1 min-h-0">
        <MessageList messages={messages} currentUserId={user?.id} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <MessageInput
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSend={handleSendMessage}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
}
