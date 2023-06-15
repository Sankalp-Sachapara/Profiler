const jwt = require('jsonwebtoken');

const chatControllerV1 = require('../controller/mobile/v1/chatController');
const UsersModel = require('../model/usersModel');

const secretKey = process.env.SECRET_KEY;

const tokenVerify = async (socket, namespace) => {
  const { token } = socket.handshake.query;

  let tokenUserId;

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      socket.emit('error', { errorType: 'CONNECTION_ERROR', message: err.message });
      socket.disconnect();
    } else {
      tokenUserId = decoded.userId;
    }
  });
  if (tokenUserId) {
    chatControllerV1.addUserWithSocketId(socket, tokenUserId, namespace);
    await UsersModel.findByIdAndUpdate({ _id: tokenUserId }, { $set: { isOnline: true } });

    socket
      .to(`${tokenUserId}-onlineStatus`)
      .emit('online-status', { onlineStatus: true, userId: tokenUserId });

    return tokenUserId;
  }
};

const versionOneEvent = async (socket, v1, tokenUserId) => {
  socket.on('join-room', ({ chatRoomId }) => {
    chatControllerV1.joiningRoom(socket, v1, { chatRoomId, tokenUserId });
  });

  socket.on('online-status', ({ userId }) => {
    chatControllerV1.onlineStatusSend(socket, userId);
  });

  socket.on('send-message', ({ chatRoomId, message, messageType }) => {
    chatControllerV1.sendMessage(socket, chatRoomId, message, messageType, tokenUserId, v1);
  });

  socket.on('get-message', ({ chatRoomId, lastMessageId, pageSize }) => {
    chatControllerV1.getMessage(socket, chatRoomId, lastMessageId, pageSize, tokenUserId);
  });

  socket.on('read-message', ({ chatRoomId, messageId }) => {
    chatControllerV1.readMessage(socket, chatRoomId, messageId, tokenUserId, v1);
  });

  socket.on('get-chat-rooms', ({ lastChatRoomsId, pageSize }) => {
    chatControllerV1.chatRoomsGet(socket, lastChatRoomsId, pageSize, tokenUserId);
  });

  socket.on('send-reveal-request', ({ chatRoomId, receiverId }) => {
    chatControllerV1.sendRevealRequest(socket, chatRoomId, receiverId, tokenUserId);
  });

  socket.on('get-connection-list', () => {
    chatControllerV1.getUserConnectionList(v1, tokenUserId);
  });

  socket.on('answer-reveal-request', ({ revealId, status }) => {
    chatControllerV1.answerRevealRequest(socket, revealId, status, tokenUserId);
  });

  socket.on('reveal-identity', ({ chatRoomId }) => {
    chatControllerV1.selfRevealIdentity(socket, chatRoomId, tokenUserId, v1);
  });

  socket.on('disconnect', () => {
    chatControllerV1.disConnect(socket, tokenUserId);
    socket
      .to(`${tokenUserId}-onlineStatus`)
      .emit('online-status', { onlineStatus: false, userId: tokenUserId });
  });
};

const socketHandler = (io) => {
  const v1 = io.of('/v1');
  v1.on('connection', async (socket) => {
    const tokenUserId = await tokenVerify(socket, '/v1');
    if (tokenUserId) {
      await versionOneEvent(socket, io, tokenUserId);
    }
  });
};

module.exports = { socketHandler };

