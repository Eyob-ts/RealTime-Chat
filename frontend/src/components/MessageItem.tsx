// React import not required with new JSX runtime

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

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-700 text-white'
      } ${message.optimistic ? 'opacity-70' : ''}`}>
        {!isOwn && (
          <div className="text-xs text-gray-300 mb-1">
            {message.user?.username ?? 'Unknown'}
          </div>
        )}
        <div className="text-sm">{message.text ?? ''}</div>
        <div className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-400'
        }`}>
          {formatTime(message.createdAt)}
          {message.optimistic && (
            <span className="ml-1">⏳</span>
          )}
        </div>
      </div>
    </div>
  );
}
