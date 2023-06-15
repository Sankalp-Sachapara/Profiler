const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer);
    return this;
  },
  getSocketServer: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
