import  io  from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected with ID:", socket.id);

  // Join a room
  socket.emit("joinRoom", { roomId: 1, userId: 1 });

  // Send a test message
  socket.emit("sendMessage", {
    text: "Hello from test client!",
    userId: 1,
    chatRoomId: 1,
  });
});

// Listen for new messages
socket.on("newMessage", (message) => {
  console.log("📩 New message:", message);
});

// Listen for errors
socket.on("connect_error", (err) => {
  console.error("❌ Connection Error:", err.message);
});
