require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { startSimulator, stopSimulator } = require('./services/eventSimulator');
const { executeSimulatedRecovery } = require('./services/simulatedRecovery');
const { getAuditLogs } = require('./services/auditLogger');
const { getRecoveryComparison } = require('./services/comparisonService');

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

// Simulated recovery execution endpoint
app.post('/api/recovery/:eventId/simulate', async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'eventId parameter is required.'
      });
    }

    const result = await executeSimulatedRecovery(eventId);

    if (result.status === 'not_found') {
      return res.status(404).json(result);
    }

    if (result.status === 'blocked' || result.status === 'unauthorized') {
      return res.status(403).json(result);
    }

    if (result.status === 'manual_review') {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('[API Error] /api/recovery/:eventId/simulate failed:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process simulated recovery.'
    });
  }
});

// Recovery Comparison endpoint (Naive AI vs MandateGuard Policy Guard)
app.get('/api/recovery/:eventId/comparison', async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'eventId parameter is required.'
      });
    }

    const comparison = await getRecoveryComparison(eventId);

    if (comparison.status === 'not_found') {
      return res.status(404).json(comparison);
    }

    return res.status(200).json(comparison);
  } catch (error) {
    console.error('[API Error] /api/recovery/:eventId/comparison failed:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to compute recovery comparison.'
    });
  }
});

// Audit log query endpoint
app.get('/api/audit', async (req, res) => {
  try {
    const { eventId, limit } = req.query;
    const logs = await getAuditLogs({ eventId, limit });
    return res.status(200).json({
      status: 'ok',
      count: logs.length,
      auditLogs: logs
    });
  } catch (error) {
    console.error('[API Error] /api/audit failed:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve audit logs.'
    });
  }
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
