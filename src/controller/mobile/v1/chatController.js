/**
 * chatController.js
 * @description :: exports chat methods
 */

const { default: mongoose } = require('mongoose');
const FCM = require('fcm-node');
const {
  CHAT_TAGS,
  NOTIFICATION_TYPE,
  REVEAL_STATUS,
  CHAT_VERSION,
} = require('../../../utils/constant');
const { multiUserNameAndProfileGet } = require('../../../utils/chatroom.common');
const {
  chatBase64Validation,
  getChatRoomValidation,
  sendMessageValidation,
  joinChatValidation,
  getMessageValidation,
  readMessageValidation,
  revealRequestValidation,
  answerRevealRequestValidation,
  onlineStatusValidation,
} = require('../../../utils/validation/chatValidation');
const { handleChatFileUploads } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const ChatRoomModel = require('../../../model/chatRoomModel');
const ChatModel = require('../../../model/chatModel');
const ChatRoomsModel = require('../../../model/chatRoomModel');
const { getSocketServer } = require('../../../../socket');
const UsersModel = require('../../../model/usersModel');
const NeedModel = require('../../../model/needModel');
const QueryModel = require('../../../model/queryModel');
const RevealModel = require('../../../model/revealModel');
const connectionRequestModel = require('../../../model/connectionRequestModel');
const { createNotification } = require('./notificationController');

const { SERVER_KEY } = process.env;
const fcm = new FCM(SERVER_KEY);

const allUsers = {};

exports.addUserWithSocketId = async (socket, tokenUserId, namespace) => {
  allUsers[tokenUserId] = { socketId: socket.id, chatRoomId: 'null', namespace };
};

exports.sendFcmNotification = async (socket, obj, fcmToken, errorType, body, title) => {
  const checkFcmToken = fcmToken
    .map((e) => {
      if (e !== 'null') {
        return e;
      }
    })
    .filter((ele) => ele);

  if (checkFcmToken.length > 0) {
    const message = {
      registration_ids: checkFcmToken,
      notification: {
        title,
        body,
      },
      data: obj.data,
    };
    fcm.send(message, (err, response) => {
      if (err) {
        socket.emit('error', { errorType, message: err });
        console.log(err);
      } else {
        console.log(response);
      }
    });
  }
};

const updateUserCurrentChatRoom = (userId, chatRoomId) => {
  allUsers[userId].chatRoomId = chatRoomId;

  return allUsers;
};

const getCurrentUserSocketId = (userId) => {
  const data = allUsers[userId.toString()];

  return data;
};

const checkUserConnectOrNot = (userId) => allUsers[userId].chatRoomId === 'null';

const removeUserFromAllUsers = (userId) => delete allUsers[userId];

const individualSendChatRoomUpdate = async (members, io, chatRoomData) =>
  members.map((e) => {
    if (allUsers[e.toString()]) {
      io.of(allUsers[e.toString()].namespace)
        .to(allUsers[e.toString()].socketId)
        .emit('chat-room-update', chatRoomData);
    }
  });

const individualSendChatNotification = async (members, io, notificationData) =>
  members.map((e) => {
    if (allUsers[e.toString()]) {
      io.of(allUsers[e.toString()].namespace)
        .to(allUsers[e.toString()].socketId)
        .emit('notification', {
          ...notificationData,
          userId: e,
        });
    }
  });

const createMessage = async (message, messageType, chatRoomId, tokenUserId) => {
  const messageCreate = new ChatModel({
    content: message,
    type: messageType,
    chatRoomId,
    read: [],
    sender: tokenUserId,
  });
  await messageCreate.save();

  return messageCreate;
};

const getMessageList = async (chatRoomId, pageSize, lastMessageId) => {
  let getLastMessageTime = new Date();

  if (lastMessageId) {
    const lastMessageData = await ChatModel.findById({ _id: lastMessageId });
    getLastMessageTime = lastMessageData.createdAt;
  }

  const getMessage = await ChatModel.aggregate([
    {
      $match: {
        chatRoomId: mongoose.Types.ObjectId(chatRoomId),
        createdAt: {
          $lt: new Date(getLastMessageTime),
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sender',
        foreignField: '_id',
        as: 'userData',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$userData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $set: {
        username: '$userData.name',
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: pageSize,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  return getMessage;
};

const queryUserAnonymousGet = async (postId) => {
  let getQueryUserAnonymous = await QueryModel.findOne({
    _id: mongoose.Types.ObjectId(postId),
  });

  getQueryUserAnonymous = {
    anonymous: getQueryUserAnonymous.anonymous,
    _id: getQueryUserAnonymous.userId,
  };

  return getQueryUserAnonymous;
};

const addedAnonymousInNameAndProfile = async (getNameAndImage, userAnonymousArray) => {
  let newData = await getNameAndImage.map(async (ele) => {
    let data;
    if (userAnonymousArray.length > 0) {
      data = await userAnonymousArray.find((e) => e._id.toString() === ele._id.toString());
    }
    if (!data) {
      return { ...ele, anonymous: false };
    }
    return { ...ele, anonymous: data.anonymous };
  });
  newData = await Promise.all(newData);

  return newData;
};

const chatRoomUpdateData = async (tokenUserId, and, pageSize, getLastChatTime) => {
  const getChatRoomsList = await ChatRoomModel.aggregate([
    {
      $match: {
        $and: and,
      },
    },
    {
      $lookup: {
        from: 'chats',
        localField: '_id',
        foreignField: 'chatRoomId',
        as: 'chatData',
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$chatData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        'chatData.createdAt': {
          $lt: new Date(getLastChatTime),
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'userData',
        pipeline: [
          {
            $match: {
              _id: {
                $nin: [new mongoose.Types.ObjectId(tokenUserId)],
              },
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$userData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: 'need',
        localField: 'postId',
        foreignField: '_id',
        as: 'needData',
        pipeline: [
          {
            $lookup: {
              from: 'needAnswer',
              localField: '_id',
              foreignField: 'needId',
              as: 'needAnswerData',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'query',
        localField: 'postId',
        foreignField: '_id',
        as: 'queryData',
        pipeline: [
          {
            $lookup: {
              from: 'queryAnswer',
              localField: '_id',
              foreignField: 'queryId',
              as: 'queryAnswerData',
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$queryData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$needData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$queryData.queryAnswerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$needData.needAnswerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
        masked: {
          $cond: {
            if: { $eq: ['$tag', 'QUERY'] },
            then: '$queryData.anonymous',
            else: false,
          },
        },
      },
    },
    {
      $set: {
        lastMessageDate: '$chatData.createdAt',
        lastMessageType: '$chatData.type',
        lastUserMessage: '$chatData.content',
        lastMessageSender: '$chatData.sender',
        groupId: '$userData._id',
        groupName: '$userData.name',
      },
    },
    {
      $lookup: {
        from: 'workProfile',
        localField: 'groupId',
        foreignField: 'userId',
        as: 'workData',
      },
    },
    {
      $lookup: {
        from: 'likeProfile',
        localField: 'groupId',
        foreignField: 'userId',
        as: 'likeData',
      },
    },
    {
      $unwind: {
        path: '$workData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$likeData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
        profilePicture: {
          $cond: {
            if: {
              $eq: ['$profileRefererType', 'WORK'],
            },
            then: {
              $arrayElemAt: ['$workData.images', 0],
            },
            else: {
              $arrayElemAt: ['$likeData.images', 0],
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        members: {
          $first: '$members',
        },
        chatType: {
          $first: '$chatType',
        },
        roomType: {
          $first: '$roomType',
        },
        tag: {
          $first: '$tag',
        },
        postId: {
          $first: '$postId',
        },
        createdAt: {
          $first: '$createdAt',
        },
        updatedAt: {
          $first: '$updatedAt',
        },
        profileRefererType: {
          $first: '$profileRefererType',
        },
        isDeleted: {
          $first: '$isDeleted',
        },
        masked: {
          $first: '$masked',
        },
        lastMessageDate: {
          $first: '$lastMessageDate',
        },
        lastMessageType: {
          $first: '$lastMessageType',
        },
        lastUserMessage: {
          $first: '$lastUserMessage',
        },
        lastMessageSender: {
          $first: '$lastMessageSender',
        },
        groupId: {
          $first: '$groupId',
        },
        groupName: {
          $first: '$groupName',
        },
        profilePicture: {
          $first: '$profilePicture',
        },
      },
    },
    {
      $sort: {
        lastMessageDate: -1,
      },
    },
    {
      $limit: pageSize,
    },
  ]);
  return getChatRoomsList;
};

const getAllUserExcludeSenderUser = async (chatRoomId, tokenUserId) => {
  const getAllUser = await ChatRoomModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatRoomId),
      },
    },
    {
      $unwind: {
        path: '$members',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        members: {
          $nin: [new mongoose.Types.ObjectId(tokenUserId)],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'userData',
      },
    },
    {
      $unwind: {
        path: '$userData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: null,
        members: {
          $push: '$members',
        },
        fcmToken: {
          $push: '$userData.fcmToken',
        },
      },
    },
  ]);
  return getAllUser;
};

const anonymousUpdateForRevealAccept = async (tag, postId, userId) => {
  if (tag === CHAT_TAGS.NEED) {
    const updateAnonymous = await NeedModel.findOneAndUpdate(
      { userId: mongoose.Types.ObjectId(userId), _id: postId },
      {
        $set: { anonymous: false },
      },
      { new: true },
    );
    return updateAnonymous;
  }

  const updateAnonymous = await QueryModel.findOneAndUpdate(
    { userId: mongoose.Types.ObjectId(userId), _id: postId },
    {
      $set: { anonymous: false },
    },
    { new: true },
  );
  return updateAnonymous;
};

const emitReadMessageInAllVersion = async (chatRoomId, data) => {
  getSocketServer(undefined).of('/v1').to(chatRoomId).emit('read-message', data);

  getSocketServer(undefined).of('/v2').to(chatRoomId).emit('read-message', data);
};

const sendRevealIdentityToAllUser = async (
  members,
  userName,
  profile,
  tokenUserId,
  userData,
  io,
  socket,
) => {
  members.map(async (e) => {
    const selfRevealNotificationData = {
      userId: e.toString(),
      notificationType: NOTIFICATION_TYPE.REVEAL,
      text: `${userName} self Reveal Identity.`,
      data: {
        user_id: tokenUserId,
        name: userName,
        profile_image: profile,
        message: `${userName} self  Reveal Identity.`,
        notification_type: NOTIFICATION_TYPE.REVEAL,
      },
    };

    const { fcmToken } = await UsersModel.findOne({ _id: mongoose.Types.ObjectId(e) });

    const body = `${userName} self  Reveal Identity.`;
    await this.sendFcmNotification(
      socket,
      selfRevealNotificationData,
      [fcmToken],
      'REVEAL_IDENTITY',
      body,
      NOTIFICATION_TYPE.REVEAL,
    );

    const notificationCreate = await createNotification(selfRevealNotificationData);

    await this.notification(notificationCreate);

    const { socketId, namespace } = await getCurrentUserSocketId(e.toString());
    io.of(namespace).to(socketId).emit('reveal-identity', userData);
  });
};

const checkChatRoomBlockOrNot = async (chatRoomId, tokenUserId) => {
  const findChatRoom = await ChatRoomsModel.findOne({
    _id: mongoose.Types.ObjectId(chatRoomId),
    members: { $in: [mongoose.Types.ObjectId(tokenUserId)] },
    isBlocked: false,
  });
  return findChatRoom;
};

exports.onlineStatusSend = async (socket, userId) => {
  const validateRequest = validation.validateParamsWithJoi({ userId }, onlineStatusValidation);

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'ONLINE_STATUS', message: validateRequest.message });
    return;
  }

  const isValidUserId = await UsersModel.findById({ _id: userId });
  if (!isValidUserId) {
    socket.emit('error', { errorType: 'ONLINE_STATUS', message: 'Invalid UserId' });
  }

  socket.join(`${userId}-onlineStatus`);
  const userData = allUsers[userId];
  if (userData) {
    socket.emit('online-status', { onlineStatus: true, userId });
  } else {
    socket.emit('online-status', { onlineStatus: false, userId });
  }
};

exports.joiningRoom = async (socket, io, { chatRoomId, tokenUserId }) => {
  const validateRequest = validation.validateParamsWithJoi({ chatRoomId }, joinChatValidation);

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'JOIN_ROOM', message: validateRequest.message });
    return;
  }

  const roomId = validateRequest.value.chatRoomId;

  const findChatRoom = await checkChatRoomBlockOrNot(roomId, tokenUserId);

  if (!findChatRoom) {
    socket.emit('error', { errorType: 'JOIN_ROOM', message: 'INVALID ID' });
    return;
  }

  updateUserCurrentChatRoom(tokenUserId, roomId);

  const { socketId: userSocketId, namespace } = await getCurrentUserSocketId(tokenUserId);

  socket.join(roomId);

  const { members, tag, profileRefererType, postId } = findChatRoom;

  const getNameAndImage = await multiUserNameAndProfileGet(members, profileRefererType);

  const userAnonymous = [];

  if (tag === CHAT_TAGS.QUERY) {
    const getUserAnonymous = await queryUserAnonymousGet(postId);

    userAnonymous.push(getUserAnonymous);
  }
  const allUserProfile = await addedAnonymousInNameAndProfile(getNameAndImage, userAnonymous);

  const getRevealRequest = await RevealModel.find({ chatRoomId, receiverId: tokenUserId });

  io.of(namespace).to(userSocketId).emit('join-room', allUserProfile);

  io.of(namespace).to(userSocketId).emit('get-reveal-history', getRevealRequest);
};

exports.sendMessage = async (socket, chatRoomId, message, messageType, tokenUserId, io) => {
  const validateRequest = validation.validateParamsWithJoi(
    { chatRoomId, message, messageType },
    sendMessageValidation,
  );

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'SEND_MESSAGE', message: validateRequest.message });
    return;
  }

  const roomId = validateRequest.value.chatRoomId;
  const newMessage = validateRequest.value.message;
  const newMessageType = validateRequest.value.messageType;

  // check user connected then send message otherwise not.
  if (checkUserConnectOrNot(tokenUserId)) {
    socket.emit('error', { errorType: 'SEND_MESSAGE', message: 'You Are Not Connected' });
    return;
  }

  const findChatRoom = await checkChatRoomBlockOrNot(roomId, tokenUserId);

  if (!findChatRoom) {
    socket.emit('error', { errorType: 'JOIN_ROOM', message: 'INVALID ID' });
    return;
  }

  const { members, profileRefererType } = findChatRoom;

  const messageData = await createMessage(newMessage, newMessageType, roomId, tokenUserId);

  const and = [];
  and.push(
    { _id: mongoose.Types.ObjectId(roomId) },
    {
      isDeleted: false,
    },
    {
      isBlocked: false,
    },
  );

  const pageSize = 1;
  const getLastChatTime = new Date();
  const chatRoomData = await chatRoomUpdateData(tokenUserId, and, pageSize, getLastChatTime);

  await individualSendChatRoomUpdate(members, io, chatRoomData);

  CHAT_VERSION.map(async (e) => {
    getSocketServer(undefined).of(e).to(chatRoomId).emit('send-message', messageData);
  });

  // send Notification code

  const userId = mongoose.Types.ObjectId(tokenUserId);

  const nameAndProfile = await multiUserNameAndProfileGet([userId], profileRefererType);

  const { userName, profile } = nameAndProfile[0];

  const sendMessageNotificationData = {
    userId: roomId,
    notificationType: NOTIFICATION_TYPE.CHAT,
    text: `${userName} send Message`,
    data: {
      userId: tokenUserId,
      user_name: userName,
      user_profile: profile,
      message: newMessage,
      notification_type: NOTIFICATION_TYPE.CHAT,
    },
  };

  const getAllUserWithoutSenderUser = await getAllUserExcludeSenderUser(roomId, tokenUserId);

  await individualSendChatNotification(
    getAllUserWithoutSenderUser[0].members,
    io,
    sendMessageNotificationData,
  );
  await this.sendFcmNotification(
    socket,
    sendMessageNotificationData,
    getAllUserWithoutSenderUser[0].fcmToken,
    'SEND_MESSAGE',
    sendMessageNotificationData.data.message,
    sendMessageNotificationData.text,
  );
};

exports.getMessage = async (socket, chatRoomId, lastMessageId, pageSize, tokenUserId) => {
  const validateRequest = validation.validateParamsWithJoi(
    { chatRoomId, lastMessageId, pageSize },
    getMessageValidation,
  );

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'GET_MESSAGE', message: validateRequest.message });
    return;
  }

  const newChatRoomId = validateRequest.value.chatRoomId;
  const newLastMessageId = validateRequest.value.lastMessageId;
  const newPageSize = validateRequest.value.pageSize;

  // check user connected then get message otherwise not.
  if (checkUserConnectOrNot(tokenUserId)) {
    socket.emit('error', { errorType: 'GET_MESSAGE', message: 'You Are Not Connected' });
    return;
  }

  const checkChatRoom = await checkChatRoomBlockOrNot(newChatRoomId, tokenUserId);

  if (!checkChatRoom) {
    socket.emit('error', { errorType: 'JOIN_ROOM', message: 'INVALID ID' });
    return;
  }

  if (newLastMessageId) {
    const checkMessage = await ChatModel.findOne({
      chatRoomId: mongoose.Types.ObjectId(newChatRoomId),
      _id: mongoose.Types.ObjectId(newLastMessageId),
    });

    if (!checkMessage) {
      socket.emit('error', { errorType: 'GET_MESSAGE', message: 'INVALID ID' });
      return;
    }
  }

  const messageGet = await getMessageList(newChatRoomId, newPageSize, newLastMessageId);

  socket.emit('get-message', messageGet);
};

exports.readMessage = async (socket, chatRoomId, messageId, tokenUserId) => {
  const validateRequest = validation.validateParamsWithJoi(
    { chatRoomId, messageId },
    readMessageValidation,
  );

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'READ_MESSAGE', message: validateRequest.message });
    return;
  }

  const newChatRoomId = validateRequest.value.chatRoomId;
  const newMessageId = validateRequest.value.messageId;

  // check user connected then read message otherwise not.
  if (checkUserConnectOrNot(tokenUserId)) {
    socket.emit('error', { errorType: 'READ_MESSAGE', message: 'You Are Not Connected' });
    return;
  }

  const checkChatRoom = await checkChatRoomBlockOrNot(newChatRoomId, tokenUserId);

  if (!checkChatRoom) {
    socket.emit('error', { errorType: 'JOIN_ROOM', message: 'INVALID ID' });
    return;
  }

  const checkMessageExists = await ChatModel.findOne({
    chatRoomId: mongoose.Types.ObjectId(newChatRoomId),
    _id: mongoose.Types.ObjectId(newMessageId),
  });

  if (!checkMessageExists) {
    socket.emit('error', { errorType: 'READ_MESSAGE', message: 'INVALID ID' });
    return;
  }

  // user seen message then add in ReadUser.
  await ChatModel.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(newMessageId),
      chatRoomId: mongoose.Types.ObjectId(newChatRoomId),
    },
    {
      $push: {
        read: tokenUserId,
      },
    },
  );
  // message read then return userArray With name.
  const findReadMembers = await ChatModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(newMessageId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'read',
        foreignField: '_id',
        as: 'userData',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$userData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: '$_id',
        chatRoomId: {
          $first: '$chatRoomId',
        },
        sender: {
          $first: '$sender',
        },
        content: {
          $first: '$content',
        },
        type: {
          $first: '$type',
        },
        createdAt: {
          $first: '$createdAt',
        },
        readMember: {
          $push: '$userData',
        },
      },
    },
  ]);

  await emitReadMessageInAllVersion(newChatRoomId, findReadMembers[0]);
};

exports.chatRoomsGet = async (socket, lastChatRoomsId, pageSize, tokenUserId) => {
  const validateRequest = validation.validateParamsWithJoi(
    { lastChatRoomsId, pageSize },
    getChatRoomValidation,
  );

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'GET_CHAT_ROOM', message: validateRequest.message });
    return;
  }

  const newPageSize = validateRequest.value.pageSize;
  const newLastChatRoomsId = validateRequest.value.lastChatRoomsId;

  let getLastChatTime = new Date().toISOString();
  if (newLastChatRoomsId) {
    const checkId = await ChatRoomsModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(newLastChatRoomsId),
          members: {
            $in: [new mongoose.Types.ObjectId(tokenUserId)],
          },
          isDeleted: false,
          isBlocked: false,
        },
      },
    ]);

    if (!checkId.length) {
      socket.emit('error', { errorType: 'GET_CHAT_ROOM', message: 'INVALID ID' });
      return;
    }

    getLastChatTime = await ChatRoomsModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(newLastChatRoomsId),
          members: {
            $in: [new mongoose.Types.ObjectId(tokenUserId)],
          },
          isDeleted: false,
          isBlocked: false,
        },
      },
      {
        $lookup: {
          from: 'chats',
          localField: '_id',
          foreignField: 'chatRoomId',
          as: 'chatData',
          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$chatData',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    getLastChatTime = getLastChatTime[0].chatData.createdAt;
  }

  const and = [];
  and.push(
    {
      members: {
        $in: [new mongoose.Types.ObjectId(tokenUserId)],
      },
    },
    {
      isDeleted: false,
    },
    {
      isBlocked: false,
    },
  );

  const getChatRoomsList = await chatRoomUpdateData(tokenUserId, and, newPageSize, getLastChatTime);

  socket.emit('get-chat-rooms', getChatRoomsList);
};

exports.notification = async (data) => {
  const socket = getSocketServer(undefined);
  if (!socket) {
    return;
  }

  const userIdAndNameSpace = await getCurrentUserSocketId(data.userId);

  if (!userIdAndNameSpace) {
    return;
  }

  const { socketId, namespace } = userIdAndNameSpace;

  socket.of(namespace).to(socketId).emit('notification', data);
};

exports.sendRevealRequest = async (socket, chatRoomId, receiverId, tokenUserId) => {
  const validateRequest = validation.validateParamsWithJoi(
    { chatRoomId, receiverId },
    revealRequestValidation,
  );

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'REVEAL_REQUEST', message: validateRequest.message });
    return;
  }

  const newChatRoomId = validateRequest.value.chatRoomId;
  const newReceiverId = validateRequest.value.receiverId;

  const getChatRoom = await ChatRoomsModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(newChatRoomId),
        members: {
          $in: [new mongoose.Types.ObjectId(newReceiverId)],
        },
        isBlocked: false,
      },
    },
  ]);

  if (getChatRoom.length < 0) {
    socket.emit('error', { errorType: 'REVEAL_REQUEST', message: 'INVALID ID' });
    return;
  }

  if (tokenUserId === newReceiverId) {
    socket.emit('error', { errorType: 'REVEAL_REQUEST', message: "You can't send to yourself" });
    return;
  }

  const checkRequest = await RevealModel.findOne({
    chatRoomId: newChatRoomId,
    senderId: tokenUserId,
    receiverId: newReceiverId,
  });

  if (checkRequest) {
    socket.emit('error', { errorType: 'REVEAL_REQUEST', message: 'Already Reveal Send' });
    return;
  }

  const createReveal = await new RevealModel({
    chatRoomId: newChatRoomId,
    senderId: tokenUserId,
    receiverId: newReceiverId,
  });
  await createReveal.save();

  const nameAndProfile = await multiUserNameAndProfileGet(
    [mongoose.Types.ObjectId(tokenUserId)],
    getChatRoom[0].profileRefererType,
  );

  const { userName, profile } = nameAndProfile[0];

  const { fcmToken } = await UsersModel.findById({ _id: newReceiverId });

  const revealRequestNotificationData = {
    userId: newReceiverId,
    notificationType: NOTIFICATION_TYPE.REVEAL,
    text: `${userName} Asking to Reveal Identity.`,
    data: {
      user_id: tokenUserId,
      name: userName,
      profile_image: profile,
      message: `${userName} Asking to Reveal Identity.`,
      notification_type: NOTIFICATION_TYPE.REVEAL,
    },
  };
  const body = `${userName} has requested to reveal your name`;
  await this.sendFcmNotification(
    socket,
    revealRequestNotificationData,
    [fcmToken],
    'REVEAL_REQUEST',
    body,
    NOTIFICATION_TYPE.REVEAL,
  );

  const notificationCreate = await createNotification(revealRequestNotificationData);

  await this.notification(notificationCreate);

  const { socketId, namespace } = await getCurrentUserSocketId(newReceiverId);

  getSocketServer(undefined)
    .of(namespace)
    .to(socketId)
    .emit('send-reveal-request', { revealRequestNotificationData, createReveal });
};

exports.answerRevealRequest = async (socket, revealId, status, tokenUserId) => {
  const validateRequest = validation.validateParamsWithJoi(
    { revealId, status },
    answerRevealRequestValidation,
  );

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'REVEAL_REQUEST', message: validateRequest.message });
    return;
  }

  const newRevealId = validateRequest.value.revealId;
  const newStatus = validateRequest.value.status;

  const checkRequest = await RevealModel.findOne({ _id: mongoose.Types.ObjectId(newRevealId) });

  if (!checkRequest) {
    socket.emit('error', { errorType: 'REVEAL_REQUEST', message: 'Invalid Id' });
    return;
  }

  if (checkRequest.status === REVEAL_STATUS.REJECTED) {
    socket.emit('error', {
      errorType: 'REVEAL_REQUEST',
      message: 'Already Reveal Request Rejected..',
    });
    return;
  }

  if (checkRequest.status !== REVEAL_STATUS.PENDING) {
    socket.emit('error', {
      errorType: 'REVEAL_REQUEST',
      message: 'Already Reveal Request Accepted..',
    });
    return;
  }

  const { senderId } = checkRequest;

  const getChatRoom = await ChatRoomsModel.findOne({ _id: checkRequest.chatRoomId });

  const { tag, postId, profileRefererType } = getChatRoom;

  const nameAndImage = await multiUserNameAndProfileGet(
    [mongoose.Types.ObjectId(tokenUserId)],
    profileRefererType,
  );

  let anonymous;

  if (newStatus === REVEAL_STATUS.ACCEPTED) {
    await RevealModel.findByIdAndUpdate(
      {
        _id: newRevealId,
      },
      { $set: { status: REVEAL_STATUS.ACCEPTED } },
      { new: true },
    );
    const updateAnonymous = await anonymousUpdateForRevealAccept(tag, postId, tokenUserId);
    anonymous = updateAnonymous.anonymous;
  } else {
    await RevealModel.findByIdAndUpdate(
      {
        _id: newRevealId,
      },
      { $set: { status: REVEAL_STATUS.REJECTED } },
      { new: true },
    );
    anonymous = true;
  }

  const { userName, profile } = nameAndImage[0];

  const { fcmToken } = await UsersModel.findById({ _id: senderId });

  const answerRevealRequestNotificationData = {
    userId: senderId,
    notificationType: NOTIFICATION_TYPE.REVEAL,
    text: `${userName} ${newStatus} to Reveal Identity.`,
    data: {
      user_id: tokenUserId,
      name: userName,
      profile_image: profile,
      message: `${userName} ${newStatus} to Reveal Identity.`,
      notification_type: NOTIFICATION_TYPE.REVEAL,
    },
  };
  const body = `${userName} has responded to your reveal request`;
  await this.sendFcmNotification(
    socket,
    answerRevealRequestNotificationData,
    [fcmToken],
    'REVEAL_REQUEST',
    body,
    NOTIFICATION_TYPE.REVEAL,
  );
  const notificationCreate = await createNotification(answerRevealRequestNotificationData);

  await this.notification(notificationCreate);

  const { socketId, namespace } = await getCurrentUserSocketId(senderId);

  getSocketServer(undefined)
    .of(namespace)
    .to(socketId)
    .emit('answer-reveal-request', { ...nameAndImage[0], anonymous });
};

exports.selfRevealIdentity = async (socket, chatRoomId, tokenUserId, io) => {
  const validateRequest = validation.validateParamsWithJoi({ chatRoomId }, joinChatValidation);

  if (!validateRequest.isValid) {
    socket.emit('error', { errorType: 'REVEAL_IDENTITY', message: validateRequest.message });
    return;
  }

  const newChatRoomId = validateRequest.value.chatRoomId;

  const getChatRoom = await ChatRoomsModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(newChatRoomId),
        members: {
          $in: [new mongoose.Types.ObjectId(tokenUserId)],
        },
        isBlocked: false,
      },
    },
  ]);

  if (getChatRoom.length === 0) {
    socket.emit('error', { errorType: 'REVEAL_IDENTITY', message: 'INVALID CHAT ROOM ID' });
    return;
  }

  const existsRevealIdentity = await RevealModel.findOne({
    chatRoomId: newChatRoomId,
    senderId: tokenUserId,
    receiverId: tokenUserId,
    status: REVEAL_STATUS.ACCEPTED,
  });

  if (existsRevealIdentity) {
    socket.emit('error', {
      errorType: 'REVEAL_IDENTITY',
      message: 'You Already Reveal Your Identity',
    });
    return;
  }

  const existsReveal = await RevealModel.findOne({
    chatRoomId: newChatRoomId,
    receiverId: tokenUserId,
  });

  if (existsReveal && existsReveal.status === REVEAL_STATUS.ACCEPTED) {
    socket.emit('error', {
      errorType: 'REVEAL_IDENTITY',
      message: 'Your identity is already revealed',
    });
    return;
  }

  if (existsReveal && existsReveal.status === REVEAL_STATUS.PENDING) {
    await RevealModel.findOneAndUpdate(
      {
        chatRoomId: newChatRoomId,
        receiverId: tokenUserId,
      },
      { $set: { status: REVEAL_STATUS.ACCEPTED } },
      { new: true },
    );
  } else {
    const createReveal = await new RevealModel({
      chatRoomId: newChatRoomId,
      senderId: tokenUserId,
      receiverId: tokenUserId,
      status: REVEAL_STATUS.ACCEPTED,
    });
    await createReveal.save();
  }

  const { tag, postId, profileRefererType } = getChatRoom[0];

  await anonymousUpdateForRevealAccept(tag, postId, tokenUserId);

  const nameAndProfile = await multiUserNameAndProfileGet(
    [mongoose.Types.ObjectId(tokenUserId)],
    profileRefererType,
  );

  const { userName, profile } = nameAndProfile[0];

  const getAllUserWithoutSenderUser = await getAllUserExcludeSenderUser(newChatRoomId, tokenUserId);

  const { members } = getAllUserWithoutSenderUser[0];

  const userData = { ...nameAndProfile[0], anonymous: false };

  await sendRevealIdentityToAllUser(members, userName, profile, tokenUserId, userData, io, socket);
};

exports.getUserConnectionList = async (io, tokenUserId) => {
  const getConnectionList = await connectionRequestModel.aggregate([
    {
      $match: {
        isDeleted: false,
        status: 'ACCEPTED',
        chatExpiryTime: { $gt: new Date() },
        $or: [
          {
            senderId: new mongoose.Types.ObjectId(tokenUserId),
          },
          {
            receiverId: new mongoose.Types.ObjectId(tokenUserId),
          },
        ],
      },
    },
    {
      $set: {
        users: {
          $cond: {
            if: {
              $eq: ['$senderId', new mongoose.Types.ObjectId(tokenUserId)],
            },
            then: '$receiverId',
            else: '$senderId',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'likeProfile',
        localField: 'users',
        foreignField: 'userId',
        as: 'likeProfileData',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'workProfile',
        localField: 'users',
        foreignField: 'userId',
        as: 'workProfileData',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $set: {
        profileData: {
          $cond: {
            if: {
              $eq: ['$CONNECTION_TYPE', 'LIKE'],
            },
            then: '$likeProfileData',
            else: '$workProfileData',
          },
        },
      },
    },
    {
      $unwind: {
        path: '$profileData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $unwind: {
        path: '$profileData.userData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $set: {
        'profileData.userName': '$profileData.userData.name',
      },
    },
    {
      $unset: ['profileData.userData', 'likeProfileData', 'workProfileData', 'users'],
    },
    {
      $lookup: {
        from: 'chatRooms',
        localField: 'senderId',
        foreignField: 'members',
        pipeline: [
          {
            $match: {
              chatType: 'CHAT',
            },
          },
        ],
        as: 'chatRoom',
      },
    },
    {
      $match: {
        chatRoom: { $exists: true, $not: { $size: 0 } },
      },
    },
    {
      $sort: {
        chatExpiryTime: 1,
      },
    },
  ]);
  const { socketId: userSocketId, namespace } = await getCurrentUserSocketId(tokenUserId);
  io.of(namespace).to(userSocketId).emit('get-connection-list', getConnectionList);
};

exports.disConnect = async (socket, tokenUserId) => {
  const userRemove = await removeUserFromAllUsers(tokenUserId);

  if (userRemove) {
    await UsersModel.findByIdAndUpdate({ _id: tokenUserId }, { $set: { isOnline: false } });
    socket.disconnect();
  }
};

exports.chatImageAndPdfStore = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, chatBase64Validation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { base64 } = validateRequest.value;

    const uploadData = await handleChatFileUploads(base64, req.userId);

    if (!uploadData.success) {
      return res.badRequest({ message: uploadData.message });
    }

    return res.ok({ message: uploadData.message, data: uploadData.path });
  } catch (err) {
    return res.failureResponse;
  }
};
