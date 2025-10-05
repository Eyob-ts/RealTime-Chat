import React from "react";

interface Room {
  id: number;
  name: string;
  isGroup: boolean;
  createdAt: string;
  participants: Array<{
    user: {
      id: number;
      username: string;
    };
  }>;
  messages: Array<{
    id: number;
    text: string;
    createdAt: string;
    user: {
      id: number;
      username: string;
    };
  }>;
}

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: number | null;
  onSelectRoom: (roomId: number) => void;
}

export function RoomList({ rooms, selectedRoomId, onSelectRoom }: RoomListProps) {
  const formatLastMessage = (room: Room) => {
    if (room.messages.length === 0) {
      return "No messages yet";
    }
    
    const lastMessage = room.messages[0];
    const maxLength = 30;
    const text = lastMessage.text.length > maxLength 
      ? lastMessage.text.substring(0, maxLength) + "..."
      : lastMessage.text;
    
    return `${lastMessage.user.username}: ${text}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.length === 0 ? (
        <div className="p-4 text-center text-gray-400">
          <p>No rooms yet</p>
          <p className="text-sm">Create a room to get started!</p>
        </div>
      ) : (
        rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`p-4 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-700 ${
              selectedRoomId === room.id ? 'bg-gray-700' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">
                    {room.name}
                  </h3>
                  {room.isGroup && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      Group
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm truncate mt-1">
                  {formatLastMessage(room)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-500 text-xs">
                    {room.participants.length} member{room.participants.length !== 1 ? 's' : ''}
                  </p>
                  {room.messages.length > 0 && (
                    <p className="text-gray-500 text-xs">
                      {formatTime(room.messages[0].createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
