import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const socket = useMemo(() => io(backend, {
    autoConnect: false,
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }), [backend]);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => console.log("socket connected", socket.id));
    socket.on("connect_error", (err) => console.warn("socket err", err));
    return () => { socket.disconnect(); };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const s = useContext(SocketContext);
  if (!s) throw new Error("useSocket must be used inside SocketProvider");
  return s;
};
