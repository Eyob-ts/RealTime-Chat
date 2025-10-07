import React, { useState, useEffect } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { RoomList } from '../components/RoomList';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchRooms,
  createRoom,
  searchUsers,
  createPrivateRoom,
  joinByInviteCode,
} from '../services/api';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const searchTimeout = useRef<number | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    const handler = async (e: any) => {
      const detail = e?.detail || e;
      if (!detail) return;
      const refreshed = await loadRooms();
      if (detail.roomId) {
        const found = refreshed.find((r: any) => r.id === detail.roomId);
        if (found) setSelectedRoomId(found.id);
      }
    };

    window.addEventListener('addedToRoom', handler as EventListener);
    return () =>
      window.removeEventListener('addedToRoom', handler as EventListener);
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
      const newRoom = await createRoom({
        name: newRoomName.trim(),
        isGroup: true,
      });

      setRooms((prev) => {
        const updatedRooms = [newRoom, ...prev];
        return updatedRooms;
      });

      setTimeout(() => {
        setSelectedRoomId(newRoom.id);
      }, 0);

      setNewRoomName('');
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.2),transparent_40%)] blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <div className="text-white text-lg font-semibold">
            Loading your chats...
          </div>
          <div className="mt-2 w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.15),transparent_40%)] blur-3xl"></div>

      {/* Sidebar Toggle Button - Visible when sidebar is hidden */}
      {!sidebarVisible && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSidebarVisible(true)}
          className="absolute top-4 left-4 z-20 bg-gradient-to-r from-indigo-500 to-pink-500 text-white p-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarVisible && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-80 bg-gray-900/80 backdrop-blur-3xl border-r border-white/10 flex flex-col relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 uppercase tracking-wider"
                >
                  Hi
                </motion.h1>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarVisible(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 md:hidden"
                    title="Hide sidebar"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 text-sm mt-2"
              >
                Welcome,{' '}
                <span className="text-indigo-400 font-medium">
                  {user?.username}
                </span>
              </motion.p>
            </div>

            {/* Search and Create Section */}
            <div className="p-4 border-b border-white/10">
              {/* Search users */}
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const q = e.target.value;
                  setSearchQuery(q);
                  if (searchTimeout.current)
                    window.clearTimeout(searchTimeout.current);
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
                className="w-full px-4 py-3 mb-3 bg-white/10 text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500 text-base transition-all duration-300"
              />

              {/* Search results */}
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-3 max-h-40 overflow-y-auto bg-white/5 rounded-xl border border-white/10"
                >
                  {searchResults.map((u: any) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5 last:border-b-0"
                    >
                      <div className="text-white font-medium">{u.username}</div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-3 py-1 rounded-lg transition-all duration-300"
                        onClick={async () => {
                          try {
                            const rawRoom = await createPrivateRoom(u.id);
                            const refreshed = await loadRooms();
                            const found = refreshed.find(
                              (r: any) => r.id === rawRoom.id
                            );
                            if (found) {
                              setSelectedRoomId(found.id);
                            } else {
                              const room = {
                                ...rawRoom,
                                participants: rawRoom.participants || [],
                                messages: rawRoom.messages || [],
                              };
                              room.messages = room.messages.map((m: any) => ({
                                id: m.id,
                                text: m.text,
                                createdAt:
                                  m.createdAt || new Date().toISOString(),
                                user: m.user || {
                                  id: m.userId || 0,
                                  username: m.username || 'Unknown',
                                },
                              }));
                              setRooms((prev) => {
                                const exists = prev.find(
                                  (r) => r.id === room.id
                                );
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
                      </motion.button>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Join by invite code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3"
              >
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Invite code"
                  className="w-full px-4 py-3 mb-2 bg-white/10 text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500 text-base transition-all duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!inviteCode.trim()) return;
                    try {
                      const joined = await joinByInviteCode(inviteCode.trim());
                      const refreshed = await loadRooms();
                      const found = refreshed.find(
                        (r: any) => r.id === joined.id
                      );
                      if (found) setSelectedRoomId(found.id);
                      setInviteCode('');
                    } catch (err) {
                      console.error('Failed to join by invite code', err);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg hover:shadow-yellow-500/25 text-white py-3 px-4 rounded-xl transition-all duration-300 font-semibold"
                >
                  Join by code
                </motion.button>
              </motion.div>

              {/* Create Room Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-lg hover:shadow-indigo-500/25 text-white py-3 px-4 rounded-xl transition-all duration-300 font-semibold mt-3"
              >
                + Create Room
              </motion.button>

              {showCreateRoom && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleCreateRoom}
                  className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4"
                >
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Room name"
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-500 text-base transition-all duration-300"
                    autoFocus
                  />
                  <div className="flex gap-3 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
                    >
                      Create
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setShowCreateRoom(false);
                        setNewRoomName('');
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 border border-white/10"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-hidden">
              <RoomList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Sidebar Toggle Button - Visible when sidebar is visible (on mobile) */}
        {sidebarVisible && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSidebarVisible(false)}
            className="absolute top-4 left-4 z-20 bg-gradient-to-r from-indigo-500 to-pink-500 text-white p-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 md:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}

        {selectedRoomId ? (
          <ChatWindow roomId={selectedRoomId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-4 uppercase tracking-wider">
                Welcome
              </h2>
              <p className="text-gray-400 text-lg">
                Select a room to start chatting or create a new one.
              </p>
              {!sidebarVisible && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setSidebarVisible(true)}
                  className="mt-6 bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show Sidebar
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
