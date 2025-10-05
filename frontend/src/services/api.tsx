const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function fetchMessages(roomId: number, limit = 50, skip = 0) {
  const res = await fetch(`${API}/messages/room/${roomId}?limit=${limit}&skip=${skip}`);
  return res.json();
}

export async function postMessage(payload: { text: string; userId: number; chatRoomId: number }) {
  const res = await fetch(`${API}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchRooms() {
  const res = await fetch(`${API}/chat`);
  return res.json();
}
