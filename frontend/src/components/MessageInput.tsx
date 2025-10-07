import React from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onKeyPress,
  onSend,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  return (
    <div className="flex gap-2">
      <input
        aria-label="Message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyPress}
        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        Send
      </button>
    </div>
  );
}
