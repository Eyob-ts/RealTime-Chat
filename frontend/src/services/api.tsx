const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export async function fetchMessages(roomId: number, limit = 50, skip = 0) {
  const res = await fetch(`${API}/rooms/${roomId}/messages?limit=${limit}&skip=${skip}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function postMessage(payload: { text: string; chatRoomId: number }) {
  const res = await fetch(`${API}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchRooms() {
  const res = await fetch(`${API}/rooms`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createRoom(payload: { name: string; isGroup?: boolean }) {
  const res = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function addUserToRoom(roomId: number, userId: number) {
  const res = await fetch(`${API}/rooms/${roomId}/add-user`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API}/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}
