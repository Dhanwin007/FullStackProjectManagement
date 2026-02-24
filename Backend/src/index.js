import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';

dotenv.config({
  path: './.env',
});

// Use one consistent port variable
const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  },
  // Adding ping settings to prevent "Connection Refused" on slow networks
  pingTimeout: 60000,
});

io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`📁 User joined project: ${projectId}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast to the project room
    io.to(data.project).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User Disconnected', socket.id);
  });
});

connectDB()
  .then(() => {
    // Listen on 'server', not 'app'
    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('FATAL: MongoDB connection error', err);
    process.exit(1);
  });