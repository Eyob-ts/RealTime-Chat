const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export async function fetchMessages(roomId: number, limit = 50, skip = 0) {
  // backend RoomsController exposes messages at /rooms/:id/messages
  const res = await fetch(
    `${API}/rooms/${roomId}/messages?limit=${limit}&skip=${skip}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
  return res.json();
}

export async function postMessage(payload: {
  text: string;
  chatRoomId: number;
}) {
  const res = await fetch(`${API}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to post message: ${res.status}`);
  return res.json();
}

export async function fetchRooms() {
  const res = await fetch(`${API}/rooms`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createRoom(payload: { name: string; isGroup?: boolean }) {
  const res = await fetch(`${API}/rooms`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create room: ${res.status}`);
  return res.json();
}

export async function addUserToRoom(roomId: number, userId: number) {
  const res = await fetch(`${API}/rooms/${roomId}/add-user`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(`Failed to add user to room: ${res.status}`);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API}/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
}

export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) return [];
  const res = await fetch(
    `${API}/rooms/search?query=${encodeURIComponent(query)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to search users: ${res.status}`);
  return res.json();
}

export async function createPrivateRoom(targetUserId: number) {
  const res = await fetch(`${API}/rooms/private/${targetUserId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to create private room: ${res.status}`);
  return res.json();
}

export async function joinByInviteCode(inviteCode: string) {
  const res = await fetch(`${API}/rooms/join-by-invite-code`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ inviteCode }),
  });
  if (!res.ok) throw new Error(`Failed to join by invite code: ${res.status}`);
  return res.json();
}
