import { io } from 'socket.io-client';

// Use import.meta.env for Vite projects
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Professional practice: connect only when needed
  withCredentials: true,
  transports: ['websocket'] // Forces websocket to avoid long-polling issues
});