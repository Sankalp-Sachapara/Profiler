const { default: mongoose } = require('mongoose');
const NeedModel = require('../../../model/needModel');
const NeedAnswerModel = require('../../../model/needAnswerModel');
const NeedSkipModel = require('../../../model/needSkipModel');
const {
  isValidObjectId,
  getLimitAndSkipSize,
  checkSkillIdOrInterestId,
  getUserSetting,
  getBlockUser,
} = require('../../../utils/common');
const {
  getUserProfileWithPreference,
  multiUserNameAndProfileGet,
  getChatRoom,
} = require('../../../utils/chatroom.common');
const validation = require('../../../utils/validateRequest');
const {
  validNeedAnsweredDetails,
  validNeedCreateOrUpdateDetails,
  validNeedAnsweredRateDetails,
} = require('../../../utils/validation/needValidation');
const {
  ACTIVE_STATUS,
  PROFILE_TYPE,
  CHAT_TAGS,
  NOTIFICATION_TYPE,
  CHAT_TYPE,
} = require('../../../utils/constant');
const ChatRoomsModel = require('../../../model/chatRoomModel');
const ChatModel = require('../../../model/chatModel');
const { createNotification } = require('./notificationController');
const { notification, sendFcmNotification } = require('./chatController');
const { getSocketServer } = require('../../../../socket');
const UsersModel = require('../../../model/usersModel');
const { addChatFlag } = require('./queryController');
const queryModel = require('../../../model/queryModel');

exports.userNeedAllAnswersGet = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.badRequest({ message: 'Invalid Id Only Valid ObjectId' });
    }
    const [, limit, skip] = getLimitAndSkipSize(req.query.page, req.query.limit);
    let getData = await NeedModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $set: {
          skillAvailableOrNot: {
            $cond: {
              if: {
                $isArray: '$skill',
              },
              then: { $size: '$skill' },
              else: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'needAnswer',
          localField: '_id',
          foreignField: 'needId',
          as: 'needAnswerData',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userData',
              },
            },
            {
              $lookup: {
                from: 'workProfile',
                localField: 'userId',
                foreignField: 'userId',
                as: 'userWorkData',
                pipeline: [{ $project: { images: 1 } }],
              },
            },
            {
              $lookup: {
                from: 'likeProfile',
                localField: 'userId',
                foreignField: 'userId',
                as: 'userLikeData',
                pipeline: [
                  {
                    $project: {
                      images: 1,
                    },
                  },
                ],
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$needAnswerData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$needAnswerData.userData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$needAnswerData.userWorkData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$needAnswerData.userLikeData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'needAnswerData.userName': '$needAnswerData.userData.name',
          'needAnswerData.userProfile': {
            $cond: {
              if: {
                $gt: ['$skillAvailableOrNot', 0],
              },
              then: {
                $arrayElemAt: ['$needAnswerData.userWorkData.images', 0],
              },
              else: {
                $arrayElemAt: ['$needAnswerData.userLikeData.images', 0],
              },
            },
          },
        },
      },
      {
        $unset: [
          'needAnswerData.userData',
          'needAnswerData.userWorkData',
          'needAnswerData.userLikeData',
        ],
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'skill',
          foreignField: '_id',
          as: 'skillData',
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
        $lookup: {
          from: 'interests',
          localField: 'interest',
          foreignField: '_id',
          as: 'interestData',
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
        $group: {
          _id: '$_id',
          status: {
            $first: '$status',
          },
          question: {
            $first: '$question',
          },
          interestData: {
            $first: '$interestData',
          },
          skillData: {
            $first: '$skillData',
          },
          createdAt: {
            $first: '$createdAt',
          },
          anonymous: {
            $first: '$anonymous',
          },
          needAnswerData: {
            $push: '$needAnswerData',
          },
        },
      },
      {
        $project: {
          status: 1,
          question: 1,
          skillData: 1,
          interestData: 1,
          createdAt: 1,
          anonymous: 1,
          needAnswerData: 1,
        },
      },
    ]);
    if (getData.length === 0) {
      return res.noContent();
    }

    getData = await addChatFlag(getData[0].needAnswerData, req.userId, CHAT_TAGS.NEED);

    return res.ok({ message: 'SuccessFully User Need All Answers Get', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.answeredListForCurrentUser = async (req, res) => {
  try {
    const [, limit, skip] = getLimitAndSkipSize(req.query.page, req.query.limit);
    const { userId } = req;

    const getBlockUserList = await getBlockUser(userId);

    let user = [];
    if (getBlockUserList && getBlockUserList.length !== 0) {
      user = getBlockUserList[0].blockUsers;
    }

    const getData = await NeedAnswerModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'answerUsers',
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
        $lookup: {
          from: 'locations',
          localField: 'userId',
          foreignField: 'userId',
          as: 'locationData',
        },
      },
      {
        $unwind: {
          path: '$locationData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'need',
          localField: 'needId',
          foreignField: '_id',
          as: 'needData',
          pipeline: [
            {
              $lookup: {
                from: 'locations',
                localField: 'userId',
                foreignField: 'userId',
                as: 'location',
              },
            },
            {
              $unwind: {
                path: '$location',
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $match: {
                userId: { $nin: user },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$needData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'needData.userId',
          foreignField: '_id',
          as: 'user',
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
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $set: {
          needUserName: '$user.name',
          needUserCity: '$needData.location.city',
          needDate: '$needData.createdAt',
          answerDate: '$createdAt',
        },
      },
      {
        $set: {
          skillAvailableOrNot: {
            $cond: {
              if: {
                $isArray: '$needData.skill',
              },
              then: {
                $size: '$needData.skill',
              },
              else: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'likeProfile',
          localField: 'needData.userId',
          foreignField: 'userId',
          as: 'likeProfile',
        },
      },
      {
        $lookup: {
          from: 'workProfile',
          localField: 'needData.userId',
          foreignField: 'userId',
          as: 'workProfile',
        },
      },
      {
        $unwind: {
          path: '$likeProfile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          needUserProfile: {
            $cond: {
              if: {
                $eq: ['$skillAvailableOrNot', 1],
              },
              then: ['$workProfile'],
              else: ['$likeProfile'],
            },
          },
        },
      },
      {
        $unwind: {
          path: '$needUserProfile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$answerUsers',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          questionId: '$needData._id',
          userId: '$needData.userId',
          question: '$needData.question',
          answerUserName: '$answerUsers.name',
          needDate: 1,
          answerDate: 1,
          needUserCity: 1,
          answerId: '$_id',
          answer: 1,
          read: 1,
          rate: 1,
          needUserName: 1,
          needUserProfile: 1,
          answerUserCity: '$locationData.city',
        },
      },
      {
        $unset: ['_id'],
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    if (getData.length === 0) {
      return res.noContent();
    }
    return res.ok({
      message: 'SuccessFully Get List Of Questions That Were Answered By The Current User',
      data: getData,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.askedListForCurrentUser = async (req, res) => {
  try {
    const [, limit, skip] = getLimitAndSkipSize(req.query.page, req.query.limit);
    const { userId } = req;
    const getData = await NeedModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'userId',
          foreignField: 'userId',
          as: 'locationData',
        },
      },
      {
        $unwind: {
          path: '$locationData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'saved',
          localField: '_id',
          foreignField: 'objectId',
          as: 'savedData',
        },
      },
      {
        $lookup: {
          from: 'needAnswer',
          localField: '_id',
          foreignField: 'needId',
          as: 'needAnswerData',
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'skill',
          foreignField: '_id',
          as: 'skillData',
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
        $lookup: {
          from: 'interests',
          localField: 'interest',
          foreignField: '_id',
          as: 'interestData',
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
        $set: {
          savedData: {
            $cond: {
              if: {
                $isArray: '$savedData',
              },
              then: {
                $size: '$savedData',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          'needAnswerData.isDeleted': false,
        },
      },
      {
        $project: {
          userId: 1,
          question: 1,
          anonymous: 1,
          createdAt: 1,
          skillData: 1,
          interestData: 1,
          status: 1,
          city: '$locationData.city',
          saved: {
            $cond: {
              if: {
                $gt: ['$savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          numberOfAnswer: {
            $cond: {
              if: {
                $isArray: '$needAnswerData',
              },
              then: {
                $size: '$needAnswerData',
              },
              else: 0,
            },
          },
          newAnswer: {
            $size: {
              $filter: {
                input: '$needAnswerData',
                cond: {
                  $eq: ['$$this.read', false],
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    if (getData.length === 0) {
      return res.noContent();
    }
    return res.ok({
      message: 'SuccessFully Get List Of Questions That Were Asked By The Current User',
      data: getData,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.answeredForNeed = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, validNeedAnsweredDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { needId, answer } = validateRequest.value;
    const { userId } = req;

    let type;
    const isValidNeedId = await NeedModel.findById({ _id: needId });
    if (!isValidNeedId) {
      return res.badRequest({ message: 'Invalid NeedId' });
    }

    if (userId.toString() === isValidNeedId.userId.toString()) {
      return res.badRequest({ message: 'You can not answer your need yourself' });
    }

    if (isValidNeedId.skill.length > 0) {
      type = PROFILE_TYPE.WORK;
    } else if (isValidNeedId.interest.length > 0) {
      type = PROFILE_TYPE.LIKE;
    }

    const checkAlreadyAnsweredOrNot = await NeedAnswerModel.findOne({ userId, needId });
    if (checkAlreadyAnsweredOrNot) {
      return res.badRequest({ message: 'You Are Already Answered For This Requirement...' });
    }
    const createNeedAnswered = new NeedAnswerModel({
      userId,
      needId,
      answer,
    });
    await createNeedAnswered.save();

    const nameAndProfile = await multiUserNameAndProfileGet([req.userId], type);

    const { userName, profile } = nameAndProfile[0];
    const { fcmToken } = await UsersModel.findById({ _id: isValidNeedId.userId });
    const needAnswerNotification = {
      userId: isValidNeedId.userId,
      notificationType: NOTIFICATION_TYPE.NEED,
      text: `${userName} Answered Your Question. ${isValidNeedId.question}`,
      data: {
        user_id: req.userId,
        name: userName,
        profile_image: profile,
        message: answer,
        notification_type: NOTIFICATION_TYPE.NEED,
      },
    };

    const notificationCreate = await createNotification(needAnswerNotification);

    await notification(notificationCreate);

    const socket = getSocketServer(undefined);
    if (!socket) {
      return;
    }
    const body = `${userName} Answered Your Question. ${isValidNeedId.question}`;
    await sendFcmNotification(
      socket,
      needAnswerNotification,
      [fcmToken],
      'NEED_ANSWER',
      body,
      NOTIFICATION_TYPE.NEED,
    );

    return res.ok({
      message: 'SuccessFully Answered For Need..',
      data: createNeedAnswered,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

const isValidNeedAndAnswerId = (answerId, id) =>
  new Promise((resolve, reject) => {
    (async () => {
      if (!isValidObjectId(answerId)) {
        return reject({ message: 'Invalid AnswerId ', errorType: 'rate' });
      }
      if (!isValidObjectId(id)) {
        return reject({ message: 'Invalid NeedId ', errorType: 'rate' });
      }
      const getAnswered = await NeedAnswerModel.findById({
        _id: answerId,
      });
      if (!getAnswered) {
        return reject({ message: 'Answer Not Found..', errorType: 'rate' });
      }
      resolve(getAnswered);
    })();
  });

exports.answeredRate = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validNeedAnsweredRateDetails,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { answerId, id } = req.params;
    const { userId } = req;
    let type;
    const getAnswered = await isValidNeedAndAnswerId(answerId, id);

    if (!getAnswered) {
      return res.badRequest({ message: 'Answer Not Found..' });
    }

    const checkOwnerOrNot = await NeedModel.findById({ _id: id });
    if (checkOwnerOrNot.userId.toString() !== userId.toString()) {
      return res.badRequest({ message: 'Only owner can rate..' });
    }

    if (getAnswered.rate !== 0) {
      return res.badRequest({ message: `You have already given the rate ${getAnswered.rate}` });
    }

    if (checkOwnerOrNot.skill.length > 0) {
      type = PROFILE_TYPE.WORK;
    } else if (checkOwnerOrNot.interest.length > 0) {
      type = PROFILE_TYPE.LIKE;
    }

    const needRateUpdate = await NeedAnswerModel.findByIdAndUpdate(
      { _id: answerId },
      {
        $set: {
          rate: validateRequest.value.rate,
        },
      },
      {
        new: true,
      },
    );

    const nameAndProfile = await multiUserNameAndProfileGet([req.userId], type);

    const { userName, profile } = nameAndProfile[0];

    const { fcmToken } = await UsersModel.findById({ _id: needRateUpdate.userId });
    const answerRatingNotification = {
      userId: needRateUpdate.userId,
      notificationType: NOTIFICATION_TYPE.NEED,
      text: `${userName} Given Your Answered Question ${needRateUpdate.rate} Rate.`,
      data: {
        user_id: req.userId,
        name: userName,
        profile_image: profile,
        message: validateRequest.value.rate,
        notification_type: NOTIFICATION_TYPE.NEED,
      },
    };

    const notificationCreate = await createNotification(answerRatingNotification);

    await notification(notificationCreate);

    const socket = getSocketServer(undefined);
    if (!socket) {
      return;
    }
    const body = `${userName} Given Your Answered Question ${needRateUpdate.rate} Rate.`;
    await sendFcmNotification(
      socket,
      answerRatingNotification,
      [fcmToken],
      'NEED_RATE',
      body,
      NOTIFICATION_TYPE.NEED,
    );

    return res.ok({
      message: 'SuccessFull..',
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.createNeed = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validNeedCreateOrUpdateDetails,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    const { question, skill, interest } = validateRequest.value;
    const obj = await checkSkillIdOrInterestId(skill, interest, userId, question);

    const needCreate = new NeedModel(obj);
    await needCreate.save();
    return res.ok({ message: 'SuccessFully Create Need..', data: needCreate });
  } catch (error) {
    if (error?.errorType) {
      return res.badRequest({ message: error.message });
    }
    return res.failureResponse();
  }
};

exports.updateNeed = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validNeedCreateOrUpdateDetails,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    const { question, skill, interest } = validateRequest.value;

    const isExitsNeedOrNot = await NeedModel.findById({ _id: req.params.id });
    if (!isExitsNeedOrNot) {
      return res.badRequest({ message: 'Need Data Not Found..' });
    }
    if (isExitsNeedOrNot.status === ACTIVE_STATUS.EXPIRED) {
      return res.badRequest({ message: 'Need Is Expired..' });
    }
    const obj = await checkSkillIdOrInterestId(skill, interest, userId, question);

    await NeedModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: obj,
      },
    );
    return res.ok({ message: 'SuccessFully Update Need..' });
  } catch (error) {
    if (error?.errorType) {
      return res.badRequest({ message: error.message });
    }
    return res.failureResponse();
  }
};

exports.needAnswerRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.query.answerId)) {
      return res.badRequest({ message: 'Invalid AnswerId' });
    }
    const isExitsAnswer = await NeedAnswerModel.findById({ _id: req.query.answerId });
    if (!isExitsAnswer) {
      return res.badRequest({ message: 'Answer Not Found...' });
    }
    await NeedAnswerModel.findByIdAndUpdate({ _id: req.query.answerId }, { $set: { read: true } });
    return res.ok({ message: 'SuccessFully Read Answer.' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.needClose = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.needId)) {
      return res.badRequest({ message: 'Invalid NeedId' });
    }
    const isExitsNeed = await NeedModel.findOne({
      _id: req.query.needId,
      userId: mongoose.Types.ObjectId(userId),
    });

    if (!isExitsNeed) {
      return res.badRequest({ message: 'Need Not Found...' });
    }
    await NeedModel.findByIdAndUpdate(
      { _id: req.query.needId },
      { $set: { status: ACTIVE_STATUS.EXPIRED } },
    );

    const findChatRooms = await ChatRoomsModel.find({
      postId: new mongoose.Types.ObjectId(req.query.needId),
    });

    if (findChatRooms.length > 0) {
      await ChatRoomsModel.updateMany(
        { postId: new mongoose.Types.ObjectId(req.query.needId) },
        { $set: { isDeleted: true } },
      );
    }

    const chatRoomListForDeleteChat = await ChatRoomsModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(req.query.needId),
        },
      },
      {
        $group: {
          _id: null,
          newID: {
            $push: '$_id',
          },
        },
      },
    ]);

    if (chatRoomListForDeleteChat.length > 0) {
      await ChatModel.updateMany(
        { chatRoomId: chatRoomListForDeleteChat[0].newID },
        { $set: { isDeleted: true } },
      );
    }

    return res.ok({ message: 'SuccessFully Need Close.' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.needPause = async (req, res) => {
  try {
    const { userId } = req;

    console.log('🚀 ~ file: needController.js:970 ~ exports.needPause= ~ req.query:', req.query);
    if (!isValidObjectId(req.query.needId)) {
      return res.badRequest({ message: 'Invalid NeedId' });
    }
    const isExitsNeed = await NeedModel.findOne({
      _id: req.query.needId,
      userId: mongoose.Types.ObjectId(userId),
      status: { $not: { $eq: ACTIVE_STATUS.EXPIRED } },
    });

    if (!isExitsNeed) {
      return res.badRequest({ message: 'Need Not Found...' });
    }
    await NeedModel.findByIdAndUpdate(
      { _id: req.query.needId },
      { $set: { status: ACTIVE_STATUS.PAUSED } },
    );

    return res.ok({ message: 'SuccessFully Need Paused.' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.needResume = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.needId)) {
      return res.badRequest({ message: 'Invalid NeedId' });
    }
    const isExitsNeed = await NeedModel.findOne({
      _id: req.query.needId,
      userId: mongoose.Types.ObjectId(userId),
      status: { $not: { $eq: ACTIVE_STATUS.EXPIRED } },
    });

    if (!isExitsNeed) {
      return res.badRequest({ message: 'Need Not Found...' });
    }
    await NeedModel.findByIdAndUpdate(
      { _id: req.query.needId },
      { $set: { status: ACTIVE_STATUS.ACTIVE } },
    );

    return res.ok({ message: 'SuccessFully Need Resumed.' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.needIgnore = async (req, res) => {
  try {
    if (!isValidObjectId(req.query.needId)) {
      return res.badRequest({ message: 'Invalid NeedId' });
    }
    const isExitsNeed = await NeedModel.findById({ _id: req.query.needId });
    if (!isExitsNeed) {
      return res.badRequest({ message: 'Need Not Found...' });
    }
    const { userId } = req;
    const { needId } = req.query;
    const expiryDate = new Date().setDate(new Date().getDate() + 7);
    const createIgnoreNeed = new NeedSkipModel({
      needId,
      userId,
      expiryDate,
    });
    await createIgnoreNeed.save();
    return res.ok({ message: 'SuccessFully Need Ignore.' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.initiateChatWithUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.badRequest({ message: 'Invalid Id Only Valid ObjectId' });
    }

    const getAnswerData = await NeedAnswerModel.findById({ _id: req.params.id });
    if (!getAnswerData) {
      return res.badRequest({ message: 'Invalid Id Answer Not Found' });
    }
    const currentUser = req.userId;
    const { userId, needId } = getAnswerData;
    const getNeedData = await NeedModel.findOne({ _id: needId });

    let profileType = PROFILE_TYPE.LIKE;
    if (getNeedData.skill.length > 0) {
      profileType = PROFILE_TYPE.WORK;
    }

    const getCurrentUserDataGet = await getUserProfileWithPreference(currentUser, profileType);

    if (!getCurrentUserDataGet) {
      return res.badRequest({ message: 'No profile found for user' });
    }

    const getAnsweredUserDataGet = await getUserProfileWithPreference(userId, profileType);

    if (!getAnsweredUserDataGet) {
      return res.badRequest({ message: 'No profile found for answering user' });
    }

    const members = [userId, currentUser];

    const chatRoomData = await getChatRoom(
      needId,
      members,
      CHAT_TAGS.NEED,
      CHAT_TYPE.THREADS,
      profileType,
    );

    return res.ok({
      message: 'SuccessFully Initiate Chat With User..',
      data: {
        chatData: chatRoomData,
        needData: {
          ...getNeedData._doc,
          userName: getCurrentUserDataGet[0].userName,
          profile: getCurrentUserDataGet[0].profile,
        },
        needAnswerData: {
          ...getAnswerData._doc,
          userName: getAnsweredUserDataGet[0].userName,
          profile: getAnsweredUserDataGet[0].profile,
        },
      },
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.needDelete = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.needId)) {
      return res.badRequest({ message: 'Invalid NeedId' });
    }
    const isExitsNeed = await NeedModel.findOne({
      _id: req.query.needId,
      userId: mongoose.Types.ObjectId(userId),
    });

    if (!isExitsNeed) {
      return res.badRequest({ message: 'Need Not Found...' });
    }

    if (isExitsNeed.isDeleted === true) {
      return res.badRequest({ message: 'Need Not Found...' });
    }

    await NeedModel.findByIdAndUpdate({ _id: req.query.needId }, { $set: { isDeleted: true } });

    await NeedAnswerModel.updateMany(
      { needId: mongoose.Types.ObjectId(req.query.needId) },
      { $set: { isDeleted: true } },
    );

    const findChatRooms = await ChatRoomsModel.find({
      postId: new mongoose.Types.ObjectId(req.query.needId),
    });

    if (findChatRooms.length > 0) {
      await ChatRoomsModel.updateMany(
        { postId: new mongoose.Types.ObjectId(req.query.needId) },
        { $set: { isDeleted: true } },
      );
    }

    const chatRoomListForDeleteChat = await ChatRoomsModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(req.query.needId),
        },
      },
      {
        $group: {
          _id: null,
          newID: {
            $push: '$_id',
          },
        },
      },
    ]);

    if (chatRoomListForDeleteChat.length > 0) {
      await ChatModel.updateMany(
        { chatRoomId: chatRoomListForDeleteChat[0].newID },
        { $set: { isDeleted: true } },
      );
    }

    return res.ok({ message: 'SuccessFully Need Delete.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.needAndQueryExpire = async () => {
  const expireDate = new Date(new Date().setDate(new Date().getDate() - 7));
  await NeedModel.updateMany(
    {
      createdAt: {
        $lte: expireDate,
      },
      status: { $in: [ACTIVE_STATUS.ACTIVE, ACTIVE_STATUS.PAUSED] },
    },
    {
      $set: { status: ACTIVE_STATUS.EXPIRED },
    },
  );
  await queryModel.updateMany(
    {
      createdAt: {
        $lte: expireDate,
      },
      status: { $in: [ACTIVE_STATUS.ACTIVE, ACTIVE_STATUS.PAUSED] },
    },
    {
      $set: { status: ACTIVE_STATUS.EXPIRED },
    },
  );
};
