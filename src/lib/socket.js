// src/lib/socket.js
//
// One shared socket connection for the whole app (Socket.io client
// handles reconnection on its own — we just avoid creating a new
// connection per component).

import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return socket;
}
