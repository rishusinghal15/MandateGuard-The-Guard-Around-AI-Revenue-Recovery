require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { startSimulator, stopSimulator } = require('./services/eventSimulator');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'MandateGuard'
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`MandateGuard backend running on port ${PORT}`);
    // Start realistic event simulator
    startSimulator(io);
  });
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  stopSimulator();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopSimulator();
  process.exit(0);
});

module.exports = { app, server, io };
