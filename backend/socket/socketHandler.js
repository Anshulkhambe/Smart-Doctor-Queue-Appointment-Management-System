const { Server } = require('socket.io');

let io = null;

/**
 * Initializes Socket.io server instance with standard CORS configurations.
 * Sets up basic connection listeners and rooms.
 * 
 * @param {object} server - HTTP Server instance
 * @returns {Server} - The socket.io Server instance
 */
const initIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join doctor-specific queue rooms (for real-time queue updates)
    socket.on('join_doctor_queue', (doctorId) => {
      socket.join(`doctor:${doctorId}`);
      console.log(`[Socket] Client ${socket.id} joined doctor room: doctor:${doctorId}`);
    });

    // Leave doctor-specific queue rooms
    socket.on('leave_doctor_queue', (doctorId) => {
      socket.leave(`doctor:${doctorId}`);
      console.log(`[Socket] Client ${socket.id} left doctor room: doctor:${doctorId}`);
    });

    // Join user-specific rooms (for real-time direct notifications)
    socket.on('join_user_notifications', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket] Client ${socket.id} joined user room: user:${userId}`);
    });

    // Leave user-specific rooms
    socket.on('leave_user_notifications', (userId) => {
      socket.leave(`user:${userId}`);
      console.log(`[Socket] Client ${socket.id} left user room: user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Retrieves the active Socket.io server instance.
 * Throws an error if socket handler has not been initialized.
 * 
 * @returns {Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('[Socket] Socket.io has not been initialized yet!');
  }
  return io;
};

module.exports = {
  initIO,
  getIO
};
