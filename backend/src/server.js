const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Real-time Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5180',
      'http://localhost:5180',
      'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5180'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // User joins private notification room
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room user_${userId}`);
    }
  });

  // Client requests live salary estimate
  socket.on('request_salary_estimate', (data) => {
    socket.emit('salary_estimate_ready', {
      timestamp: Date.now(),
      status: 'processed'
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Make io accessible globally or via app
app.set('io', io);

// Boot server & test database connection
server.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`  WORKPAY AI - REST API & FINTECH SERVER ONLINE     `);
  console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Listening on: http://localhost:${PORT}             `);
  console.log('====================================================');

  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log('[System Health] Backend server ready to serve client requests.');
  } else {
    console.warn('[Notice] MySQL is currently offline or password requires configuration.');
    console.warn('[Notice] Check backend/.env to configure DB_PASSWORD and ensure MySQL service is running.');
  }
});

module.exports = { server, io };

