import { motion } from 'framer-motion';

interface Room {
  id: number;
  name: string;
  isGroup: boolean;
  inviteCode?: string;
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

export function RoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: RoomListProps) {
  const formatLastMessage = (room: Room) => {
    const messages = room.messages || [];
    if (messages.length === 0) {
      return 'No messages yet';
    }

    const lastMessage = messages[messages.length - 1]; // Get the actual last message
    const maxLength = 30;
    const text =
      lastMessage.text.length > maxLength
        ? lastMessage.text.substring(0, maxLength) + '...'
        : lastMessage.text;

    return `${lastMessage.user.username}: ${text}`;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        {rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 text-center text-gray-400 rounded-xl bg-white/5 border border-white/10 m-4"
          >
            <p className="text-lg mb-2">No rooms yet</p>
            <p className="text-sm">Create a room to get started!</p>
          </motion.div>
        ) : (
          rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectRoom(room.id)}
              className={`p-4 m-2 rounded-xl border cursor-pointer transition-all duration-300 ${
                selectedRoomId === room.id
                  ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  selectedRoomId === room.id
                    ? '0 0 25px rgba(99,102,241,0.3)'
                    : '0 0 15px rgba(255,255,255,0.1)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Room Icon/Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        selectedRoomId === room.id
                          ? 'bg-gradient-to-r from-indigo-500 to-pink-500'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700'
                      }`}
                    >
                      {room.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold truncate text-base">
                          {room.name}
                        </h3>
                        {room.isGroup && (
                          <span className="text-xs bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium">
                            Group
                          </span>
                        )}
                      </div>

                      {/* Last Message Preview */}
                      <p className="text-gray-300 text-sm truncate">
                        {formatLastMessage(room)}
                      </p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      {/* Participants Count */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        {(room.participants || []).length} member
                        {(room.participants || []).length !== 1 ? 's' : ''}
                      </div>

                      {/* Invite Code Button */}
                      {room.isGroup && room.inviteCode && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Copy invite code"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              if (room.inviteCode)
                                await navigator.clipboard.writeText(
                                  room.inviteCode
                                );
                              alert('Invite code copied to clipboard');
                            } catch (err) {
                              alert(`Invite code: ${room.inviteCode ?? ''}`);
                            }
                          }}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg border border-white/10 transition-all duration-300"
                        >
                          Copy code
                        </motion.button>
                      )}
                    </div>

                    {/* Last Message Time */}
                    {(room.messages || []).length > 0 && (
                      <p className="text-gray-400 text-xs font-medium">
                        {formatTime(
                          room.messages[room.messages.length - 1]?.createdAt
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
