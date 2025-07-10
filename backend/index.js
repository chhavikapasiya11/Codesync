require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessionRoutes');
const versionRoutes = require('./routes/versionRoutes');
const runRoutes = require('./routes/run');
const terminalHandler = require('./socket-handler');
const cors = require('cors');
const Version = require('./models/Version');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/run', runRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('CodeSync API + Socket.IO running...');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Store latest code per file per session
const latestCode = {}; // { sessionId: { filename1: code1, filename2: code2 } }

const sessionToSockets = {};
const socketToSession = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  let autoSaveInterval = null;

  socket.on('join-session', ({ sessionId, userId }) => {
    socket.join(sessionId);
    socketToSession[socket.id] = sessionId;

    if (!sessionToSockets[sessionId]) sessionToSockets[sessionId] = [];
    sessionToSockets[sessionId].push(socket.id);

    console.log(`Socket ${socket.id} joined session ${sessionId}`);

    // Initialize storage for the session if it doesn't exist
    if (!latestCode[sessionId]) {
      latestCode[sessionId] = {};
    }

    // Send all current files to the new client
    for (const [filename, code] of Object.entries(latestCode[sessionId])) {
      socket.emit('code-update', { filename, code });
    }

    // Auto-save every 5 minutes
    autoSaveInterval = setInterval(async () => {
      if (latestCode[sessionId]) {
        try {
          const version = new Version({
            sessionId,
            code: JSON.stringify(latestCode[sessionId]), // Save all files
            savedBy: userId || null,
          });
          await version.save();
          console.log(`Auto-saved version for session ${sessionId}`);
        } catch (err) {
          console.error('Auto-save error:', err);
        }
      }
    }, 300000); // 5 minutes
  });

  socket.on('code-change', ({ sessionId, filename, code }) => {
    if (!latestCode[sessionId]) {
      latestCode[sessionId] = {};
    }

    latestCode[sessionId][filename] = code;

    // Broadcast to all other clients in the session
    socket.to(sessionId).emit('code-update', { filename, code });
  });

  socket.on('disconnect', () => {
    const sessionId = socketToSession[socket.id];
    if (sessionId) {
      sessionToSockets[sessionId] = sessionToSockets[sessionId]?.filter(id => id !== socket.id);
      delete socketToSession[socket.id];
    }

    if (autoSaveInterval) clearInterval(autoSaveInterval);

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Attach terminal socket logic
terminalHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server with Socket.IO running on port ${PORT}`);
});
