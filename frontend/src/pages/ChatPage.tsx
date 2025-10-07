import React, { useState, useEffect } from "react";
import { ChatWindow } from "../components/ChatWindow";
import { RoomList } from "../components/RoomList";
import { useAuth } from "../contexts/AuthContext";
import { fetchRooms, createRoom, searchUsers, createPrivateRoom, joinByInviteCode } from "../services/api";
import { useRef } from "react";

export function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const searchTimeout = useRef<number | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    const handler = async (e: any) => {
      const detail = e?.detail || e;
      if (!detail) return;
      // reload rooms and if the room exists select it
      const refreshed = await loadRooms();
      if (detail.roomId) {
        const found = refreshed.find((r: any) => r.id === detail.roomId);
        if (found) setSelectedRoomId(found.id);
      }
    };

    window.addEventListener('addedToRoom', handler as EventListener);
    return () => window.removeEventListener('addedToRoom', handler as EventListener);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await fetchRooms();
      setRooms(data);
      if (data.length > 0 && !selectedRoomId) {
        setSelectedRoomId(data[0].id);
      }
      return data;
    } catch (error) {
      console.error('Failed to load rooms:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const newRoom = await createRoom({ name: newRoomName.trim(), isGroup: true });
      setRooms(prev => [newRoom, ...prev]);
      setSelectedRoomId(newRoom.id);
      setNewRoomName('');
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold"></h1>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">Welcome, {user?.username}</p>
        </div>

        {/* Create Room Button */}
        <div className="p-4 border-b border-gray-700">
          {/* Search users */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const q = e.target.value;
              setSearchQuery(q);
              if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
              searchTimeout.current = window.setTimeout(async () => {
                if (!q || q.trim().length === 0) {
                  setSearchResults([]);
                  return;
                }
                try {
                  const res = await searchUsers(q.trim());
                  setSearchResults(res);
                } catch (err) {
                  console.error('Search failed', err);
                }
              }, 300);
            }}
            placeholder="Search users..."
            className="w-full px-3 py-2 mb-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-2 max-h-40 overflow-y-auto">
              {searchResults.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                  <div className="text-white">{u.username}</div>
                  <button
                    className="text-sm text-blue-400"
                    onClick={async () => {
                      try {
                        const rawRoom = await createPrivateRoom(u.id);
                        console.debug('createPrivateRoom returned', rawRoom);
                        // After creating a private room on the server, refresh rooms from server
                        // and only select it if the server lists the user as a participant.
                        const refreshed = await loadRooms();
                        const found = refreshed.find((r: any) => r.id === rawRoom.id);
                        if (found) {
                          setSelectedRoomId(found.id);
                        } else {
                          console.warn('Created room exists but server did not return it as a participant yet. Adding optimistically.');
                          // normalize and add optimistic room so UI can show it immediately
                          const room = {
                            ...rawRoom,
                            participants: rawRoom.participants || [],
                            messages: rawRoom.messages || [],
                          };
                          room.messages = room.messages.map((m: any) => ({
                            id: m.id,
                            text: m.text,
                            createdAt: m.createdAt || new Date().toISOString(),
                            user: m.user || { id: m.userId || 0, username: m.username || 'Unknown' },
                          }));
                          setRooms(prev => {
                            const exists = prev.find(r => r.id === room.id);
                            if (exists) return prev;
                            return [room, ...prev];
                          });
                          setSelectedRoomId(rawRoom.id);
                        }
                        setSearchResults([]);
                        setSearchQuery('');
                      } catch (err) {
                        console.error('Failed to create private room', err);
                      }
                    }}
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
            {/* Join by invite code */}
            <div className="mt-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invite code"
                className="w-full px-3 py-2 mb-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={async () => {
                  if (!inviteCode.trim()) return;
                  try {
                    const joined = await joinByInviteCode(inviteCode.trim());
                    const refreshed = await loadRooms();
                    const found = refreshed.find((r: any) => r.id === joined.id);
                    if (found) setSelectedRoomId(found.id);
                    setInviteCode('');
                  } catch (err) {
                    console.error('Failed to join by invite code', err);
                  }
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Join by code
              </button>
            </div>
          <button
            onClick={() => setShowCreateRoom(!showCreateRoom)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            + Create Room
          </button>
          
          {showCreateRoom && (
            <form onSubmit={handleCreateRoom} className="mt-3">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomName('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Room List */}
        <RoomList
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoomId ? (
          <ChatWindow roomId={selectedRoomId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <h2 className="text-2xl mb-2">Welcome to Telegram Clone</h2>
              <p>Select a room to start chatting or create a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
