import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';

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
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      // ignore scroll errors
      console.warn('Scroll to bottom failed', e);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    // use h-full so this element fills the available height from the parent
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {!messages || messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        messages
          .filter(Boolean)
          .map((message) => (
            <MessageItem
              key={message?.id ?? Math.random()}
              message={message}
              isOwn={(message?.user?.id ?? null) === currentUserId}
            />
          ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
