/**
 * queryController.js
 * @description :: exports query method
 */

const { default: mongoose } = require('mongoose');
const { CONNECTION_STATUS } = require('../../../utils/constant');
const validation = require('../../../utils/validateRequest');
const connectionRequestValidation = require('../../../utils/validation/connectionRequestValidation');
const UsersModel = require('../../../model/usersModel');
const ConnectionRequestModel = require('../../../model/connectionRequestModel');
const { notification, sendFcmNotification } = require('./chatController');
const { createNotification } = require('./notificationController');
const { multiUserNameAndProfileGet } = require('../../../utils/chatroom.common');
const { getSocketServer } = require('../../../../socket');
const { getLimitAndSkipSize } = require('../../../utils/common');
const ChatRoomsModel = require('../../../model/chatRoomModel');

const checkChatData = async (userId, senderUserId, tag, chatExpiryTime) => {
  const findChat = await ChatRoomsModel.aggregate([
    {
      $match: {
        members: {
          $eq: [new mongoose.Types.ObjectId(senderUserId), new mongoose.Types.ObjectId(userId)],
        },
        tag,
      },
    },
    {
      $lookup: {
        from: 'chats',
        localField: '_id',
        foreignField: 'chatRoomId',
        as: 'chatData',
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
          $lt: chatExpiryTime,
        },
      },
    },
    {
      $project: {
        chat: '$chatData',
      },
    },
  ]);

  return findChat;
};

exports.createConnectionRequest = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      connectionRequestValidation.userCreateConnectionRequest,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { userId, connectionText, type } = validateRequest.value;

    const findRequestUser = await UsersModel.findOne({ _id: userId });

    if (!findRequestUser) {
      return res.badRequest({
        message: 'Invalid Id',
      });
    }

    const userConnection = await ConnectionRequestModel.findOne({
      senderId: req.userId,
      receiverId: userId,
      CONNECTION_TYPE: type,
      connectionExpiryTime: { $gt: new Date() },
    });

    if (userConnection && userConnection.status === CONNECTION_STATUS.ACCEPTED) {
      const { CONNECTION_TYPE, chatExpiryTime, _id } = userConnection;

      // Here it is checked that if the chat expiration time is over then
      // 1. Checked if the chat is created or not
      // 2. if chat not created then old data deleted and created new one.
      if (chatExpiryTime < new Date()) {
        const chatData = await checkChatData(userId, req.userId, CONNECTION_TYPE, chatExpiryTime);

        if (chatData.length > 0) {
          return res.badRequest({ message: 'Already in your Connection List' });
        }

        if (chatData.length === 0) {
          await ConnectionRequestModel.deleteOne({
            _id,
          });
        }
      }
      // Here it is checked that if the chat expiration time is not over then
      // 1. Checked if the chat is created or not
      // 2. if chat not created then returned message because he to have time to create chat.
      if (chatExpiryTime > new Date()) {
        const chatData = await checkChatData(userId, req.userId, CONNECTION_TYPE, chatExpiryTime);

        if (chatData.length > 0) {
          return res.badRequest({ message: 'Already in your Connection List' });
        }
        if (chatData.length === 0) {
          return res.badRequest({ message: 'Already Accepted' });
        }
      }
    }

    if (userConnection && userConnection.status === CONNECTION_STATUS.PENDING) {
      return res.badRequest({ message: 'Already Connection request Send' });
    }

    if (userConnection && userConnection.status === CONNECTION_STATUS.REJECTED) {
      await ConnectionRequestModel.deleteOne({
        _id: userConnection._id,
      });
    }

    const checkUserBConnection = await ConnectionRequestModel.findOne({
      senderId: userId,
      receiverId: req.userId,
      CONNECTION_TYPE: type,
      connectionExpiryTime: { $gt: new Date() },
    });

    if (checkUserBConnection && checkUserBConnection.status === CONNECTION_STATUS.PENDING) {
      const connectionCreated = await ConnectionRequestModel.findByIdAndUpdate(
        { _id: checkUserBConnection._id },
        { $set: { status: CONNECTION_STATUS.ACCEPTED } },
        { new: true },
      );

      return res.ok({ message: 'SuccessFully connection Created', data: connectionCreated });
    }

    const date = new Date();
    date.setDate(date.getDate() + 7);

    const createRequest = await ConnectionRequestModel.create({
      senderId: req.userId,
      receiverId: userId,
      connectionText,
      CONNECTION_TYPE: type,
      connectionExpiryTime: date,
    });
    await createRequest.save();

    const nameAndProfile = await multiUserNameAndProfileGet([req.userId], type);

    const { userName, profile } = nameAndProfile[0];
    const { fcmToken } = await UsersModel.findById({ _id: createRequest.receiverId });

    const createConnectionRequestNotification = {
      userId: createRequest.receiverId,
      notificationType: type,
      text: `${userName} send to ${type} request.`,
      data: {
        user_id: req.userId,
        name: userName,
        profile_image: profile,
        message: createRequest.connectionText,
        notification_type: type,
      },
    };

    const notificationCreate = await createNotification(createConnectionRequestNotification);

    await notification(notificationCreate);

    const socket = getSocketServer(undefined);
    if (!socket) {
      return;
    }
    const body = `${userName} send to ${type} request.`;
    await sendFcmNotification(
      socket,
      createConnectionRequestNotification,
      [fcmToken],
      'CONNECTION_REQUEST_SENT',
      body,
      'CONNECTION',
    );

    return res.ok({
      message: 'SuccessFully Send Connection Request',
      data: createRequest,
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.connectionReject = async (req, res) => {
  try {
    const { connectionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    const findConnection = await ConnectionRequestModel.findOne({
      _id: connectionId,
      connectionExpiryTime: { $gt: new Date() },
    });

    if (!findConnection) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    if (findConnection.status !== CONNECTION_STATUS.PENDING) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    await ConnectionRequestModel.findByIdAndUpdate(
      {
        _id: connectionId,
      },
      {
        $set: { status: CONNECTION_STATUS.REJECTED },
      },
      {
        new: true,
      },
    );

    return res.ok({ message: 'Connection Rejected SuccessFully.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.connectionAccepted = async (req, res) => {
  try {
    const { connectionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    const findConnection = await ConnectionRequestModel.findOne({
      _id: connectionId,
      connectionExpiryTime: { $gt: new Date() },
    });

    if (!findConnection) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    if (findConnection.status !== CONNECTION_STATUS.PENDING) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    const date = new Date();
    date.setDate(date.getDate() + 2);

    const updatedRequestData = await ConnectionRequestModel.findByIdAndUpdate(
      {
        _id: connectionId,
      },
      {
        $set: { status: CONNECTION_STATUS.ACCEPTED, chatExpiryTime: date },
      },
      {
        new: true,
      },
    );

    const nameAndProfile = await multiUserNameAndProfileGet(
      [req.userId],
      updatedRequestData.CONNECTION_TYPE,
    );

    const { userName, profile } = nameAndProfile[0];
    const { fcmToken } = await UsersModel.findById({ _id: updatedRequestData.senderId });
    const connectionAcceptedNotification = {
      userId: updatedRequestData.senderId,
      notificationType: updatedRequestData.CONNECTION_TYPE,
      text: `${userName} Accept to ${updatedRequestData.CONNECTION_TYPE} request.`,
      data: {
        user_id: req.userId,
        name: userName,
        profile_image: profile,
        message: updatedRequestData.connectionText,
        notification_type: updatedRequestData.CONNECTION_TYPE,
      },
    };

    const notificationCreate = await createNotification(connectionAcceptedNotification);

    await notification(notificationCreate);

    const socket = getSocketServer(undefined);
    if (!socket) {
      return;
    }
    const body = `${userName} Accept to ${updatedRequestData.CONNECTION_TYPE} request.`;
    await sendFcmNotification(
      socket,
      connectionAcceptedNotification,
      [fcmToken],
      'CONNECTION_REQUEST_ACCEPT',
      body,
      'CONNECTION',
    );

    return res.ok({ message: 'Connection Accepted SuccessFully.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.totalPendingConnection = async (req, res) => {
  try {
    const { userId } = req;

    const pendingConnection = await ConnectionRequestModel.aggregate([
      {
        $match: {
          receiverId: mongoose.Types.ObjectId(userId),
          status: 'PENDING',
          connectionExpiryTime: { $gt: new Date() },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
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
        $set: {
          name: '$userData.name',
        },
      },
      {
        $unset: 'userData',
      },
      {
        $lookup: {
          from: 'workProfile',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'workData',
        },
      },
      {
        $unwind: {
          path: '$workData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          image: '$workData.images',
          jobRole: {
            $cond: {
              if: {
                $eq: ['$CONNECTION_TYPE', 'WORK'],
              },
              then: '$workData.jobRole',
              else: null,
            },
          },
        },
      },
      {
        $unset: 'workData',
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'locationData',
        },
      },
      {
        $unwind: {
          path: '$locationData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const totalPendingRequest = pendingConnection.length;

    if (totalPendingRequest === 0) {
      return res.noContent();
    }

    return res.ok({
      message: 'SuccessFully Get Pending Request',
      data: { pendingConnection, totalPendingRequest },
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.connectionQrAccept = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      connectionRequestValidation.userQrConnectionValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { userId, type } = validateRequest.value;

    const findRequestUser = await UsersModel.findOne({ _id: userId });

    if (!findRequestUser) {
      return res.badRequest({
        message: 'Invalid Id',
      });
    }

    const checkUserBConnection = await ConnectionRequestModel.findOne({
      senderId: userId,
      receiverId: req.userId,
      CONNECTION_TYPE: type,
      status: CONNECTION_STATUS.ACCEPTED,
    });

    if (checkUserBConnection) {
      return res.badRequest({ message: 'User Already Connected' });
    }

    const userConnection = await ConnectionRequestModel.findOne({
      senderId: req.userId,
      receiverId: userId,
      CONNECTION_TYPE: type,
      connectionExpiryTime: { $gt: new Date() },
    });

    if (userConnection && userConnection.status === CONNECTION_STATUS.ACCEPTED) {
      return res.badRequest({ message: 'user Already Connected' });
    }

    if (userConnection && userConnection.status === CONNECTION_STATUS.REJECTED) {
      await ConnectionRequestModel.deleteOne({
        _id: userConnection._id,
      });
    }

    const date = new Date();
    date.setDate(date.getDate() + 2);

    if (userConnection && userConnection.status === CONNECTION_STATUS.PENDING) {
      const acceptRequest = await ConnectionRequestModel.findByIdAndUpdate(
        {
          _id: userConnection._id,
        },
        {
          $set: { status: CONNECTION_STATUS.ACCEPTED, chatExpiryTime: date },
        },
        { new: true },
      );

      return res.ok({ message: 'SuccessFully User Connection With QR', data: acceptRequest });
    }

    const createRequest = await ConnectionRequestModel.create({
      senderId: req.userId,
      receiverId: userId,
      CONNECTION_TYPE: type,
      status: CONNECTION_STATUS.ACCEPTED,
    });
    await createRequest.save();

    return res.ok({
      message: 'SuccessFully Connection User With QR Scan....',
      data: createRequest,
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.connectionRequestRejectByCron = async () => {
  const find = await ConnectionRequestModel.find({
    chatExpiryTime: { $lt: new Date() },
  });

  find.map(async (e) => {
    const chatExistsOrNot = await ChatRoomsModel.aggregate([
      {
        $match: {
          members: {
            $eq: [
              new mongoose.Types.ObjectId(e.senderId),
              new mongoose.Types.ObjectId(e.receiverId),
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'chats',
          localField: '_id',
          foreignField: 'chatRoomId',
          as: 'chatData',
        },
      },
    ]);

    if (chatExistsOrNot.length === 0 || chatExistsOrNot[0].chatData.length === 0) {
      await ConnectionRequestModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(e._id) });
    }
  });
};

exports.connectionRequestCount = async (req, res) => {
  try {
    const getConnectionCount = await ConnectionRequestModel.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              receiverId: new mongoose.Types.ObjectId(req.userId),
            },
          ],
          status: CONNECTION_STATUS.ACCEPTED,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'result',
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $count: 'connectionCount',
      },
    ]);

    return res.ok({
      message: 'SuccessFully Connection Count Get',
      data: { connectionCount: getConnectionCount[0].connectionCount },
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.connectionListBothMode = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.query,
      connectionRequestValidation.userConnectionList,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { connectionType } = validateRequest.value;
    let { name } = validateRequest.value;

    if (!name) {
      name = '';
    }

    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );

    const getConnectionCount = await ConnectionRequestModel.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              receiverId: new mongoose.Types.ObjectId(req.userId),
            },
          ],
          status: CONNECTION_STATUS.ACCEPTED,
          CONNECTION_TYPE: connectionType,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'result',
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                _id: 1,
              },
            },
            {
              $lookup: {
                from: 'locations',
                localField: '_id',
                foreignField: 'userId',
                as: 'locationsData',
                pipeline: [
                  {
                    $project: {
                      city: 1,
                      state: 1,
                      country: 1,
                      userId: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: 'workProfile',
                localField: '_id',
                foreignField: 'userId',
                as: 'workprofileData',
                pipeline: [
                  {
                    $project: {
                      jobRole: 1,
                      aboutMe: 1,
                      images: {
                        $arrayElemAt: ['$images', 0],
                      },
                      userId: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: 'likeProfile',
                localField: '_id',
                foreignField: 'userId',
                as: 'likeprofileData',
                pipeline: [
                  {
                    $project: {
                      aboutMe: 1,
                      images: {
                        $arrayElemAt: ['$images', 0],
                      },
                      userId: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$result.locationsData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          'result.name': {
            $regex: name,
            $options: 'i',
          },
        },
      },
      {
        $project: {
          senderId: 1,
          receiverId: 1,
          connectionText: 1,
          CONNECTION_TYPE: 1,
          status: 1,
          username: '$result.name',
          'location.city': '$result.locationsData.city',
          'location.state': '$result.locationsData.state',
          'location.country': '$result.locationsData.country',
          workprofileData: {
            $cond: {
              if: {
                $eq: ['$CONNECTION_TYPE', 'WORK'],
              },
              then: '$result.workprofileData',
              else: null,
            },
          },
          likeprofileData: {
            $cond: {
              if: {
                $eq: ['$CONNECTION_TYPE', 'LIKE'],
              },
              then: '$result.likeprofileData',
              else: null,
            },
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (getConnectionCount.length === 0) {
      return res.noContent();
    }

    return res.ok({
      message: 'SuccessFully Connection List Get',
      data: getConnectionCount,
    });
  } catch (error) {
    return res.failureResponse();
  }
};
