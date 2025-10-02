import React, { useState } from "react";
import { ChatWindow } from "../components/ChatWindow";
import { SocketProvider } from "../sockets/SocketProvider";

// For now, we hardcode user + room.
// Later: replace with login/room select.
const DEFAULT_ROOM_ID = 1;
const DEFAULT_USER_ID = 1;

export function ChatPage() {
  const [roomId] = useState(DEFAULT_ROOM_ID);
  const [userId] = useState(DEFAULT_USER_ID);

  return (
    <SocketProvider>
      <div className="flex flex-col h-[90vh] w-[90vw] bg-white rounded shadow-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-semibold">
          Real-time Chat (Room {roomId})
        </div>
        <ChatWindow roomId={roomId} userId={userId} />
      </div>
    </SocketProvider>
  );
}
