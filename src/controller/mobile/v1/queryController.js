/**
 * queryController.js
 * @description :: exports query method
 */

const { default: mongoose } = require('mongoose');
const {
  getLimitAndSkipSize,
  isValidObjectId,
  checkSkillIdOrInterestId,
  getUserSetting,
  getBlockUser,
} = require('../../../utils/common');
const {
  getUserProfileWithPreference,
  getChatRoom,
  multiUserNameAndProfileGet,
} = require('../../../utils/chatroom.common');
const {
  ACTIVE_STATUS,
  PROFILE_TYPE,
  CHAT_TAGS,
  NOTIFICATION_TYPE,
  CHAT_TYPE,
  BUTTON_COLOR,
} = require('../../../utils/constant');
const validation = require('../../../utils/validateRequest');
const queryValidation = require('../../../utils/validation/queryValidation');
const QueryModel = require('../../../model/queryModel');
const QuerySkipModel = require('../../../model/querySkipModel');
const QueryAnswerModel = require('../../../model/queryAnswermodel');
const ChatRoomsModel = require('../../../model/chatRoomModel');
const ChatModel = require('../../../model/chatModel');
const { createNotification } = require('./notificationController');
const { notification, sendFcmNotification } = require('./chatController');
const { getSocketServer } = require('../../../../socket');
const UsersModel = require('../../../model/usersModel');

const isValidQueryAnswerId = (answerId, queryId) =>
  new Promise((resolve, reject) => {
    (async () => {
      if (!isValidObjectId(answerId)) {
        return reject({ message: 'Invalid AnswerId ', errorType: 'RatingForAnswer' });
      }
      if (!isValidObjectId(queryId)) {
        return reject({ message: 'Invalid QueryId ', errorType: 'RatingForAnswer' });
      }
      const getAnswered = await QueryAnswerModel.findById({
        _id: answerId,
      });
      if (!getAnswered) {
        return reject({ message: 'Answer Not Found..', errorType: 'RatingForAnswer' });
      }
      resolve(getAnswered);
    })();
  });

exports.addChatFlag = async (answerData, userId, postId) => {
  const data = answerData.map(async (e) => {
    let color;
    let queryOrNeedId;
    if (postId === CHAT_TAGS.QUERY) {
      queryOrNeedId = e.queryId;
    } else {
      queryOrNeedId = e.needId;
    }
    const findChatRoom = await ChatRoomsModel.aggregate([
      {
        $match: {
          members: {
            $in: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(e.userId)],
          },
          postId: new mongoose.Types.ObjectId(queryOrNeedId),
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

    if (findChatRoom.length === 0) {
      color = BUTTON_COLOR.GREEN;
    } else if (findChatRoom[0].isDeleted) {
      color = BUTTON_COLOR.RED;
    } else {
      color = BUTTON_COLOR.GREY; // if chatRoom and chat exists.
    }
    return { ...e, color };
  });
  const allData = await Promise.all(data);
  return allData;
};

exports.userAllQueryAnswerGet = async (req, res) => {
  try {
    const { id } = req.params;

    const [, limit, skip] = getLimitAndSkipSize(req.query.page, req.query.limit);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.badRequest({ message: 'Invalid Id Only Valid ObjectId' });
    }

    const getQueryAnswerData = await QueryModel.aggregate([
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
          from: 'queryAnswer',
          localField: '_id',
          foreignField: 'queryId',
          as: 'queryAnswerData',
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
          path: '$queryAnswerData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$queryAnswerData.userData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$queryAnswerData.userWorkData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$queryAnswerData.userLikeData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'queryAnswerData.userName': '$queryAnswerData.userData.name',
          'queryAnswerData.userProfile': {
            $cond: {
              if: {
                $gt: ['$skillAvailableOrNot', 0],
              },
              then: {
                $arrayElemAt: ['$queryAnswerData.userWorkData.images', 0],
              },
              else: {
                $arrayElemAt: ['$queryAnswerData.userLikeData.images', 0],
              },
            },
          },
        },
      },
      {
        $unset: [
          'queryAnswerData.userData',
          'queryAnswerData.userWorkData',
          'queryAnswerData.userLikeData',
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
          queryAnswerData: {
            $push: '$queryAnswerData',
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
          queryAnswerData: 1,
        },
      },
    ]);

    if (getQueryAnswerData.length === 0) {
      return res.noContent();
    }

    const newData = await this.addChatFlag(
      getQueryAnswerData[0].queryAnswerData,
      req.userId,
      CHAT_TAGS.QUERY,
    );

    return res.ok({
      message: 'SuccessFully User query All Answers Get',
      data: { ...getQueryAnswerData[0], queryAnswerData: newData },
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.userQuestionAnswered = async (req, res) => {
  try {
    const { userId } = req;

    const [, limit, skip] = getLimitAndSkipSize(req.query.page, req.query.limit);

    const getBlockUserList = await getBlockUser(userId);

    let user = [];
    if (getBlockUserList && getBlockUserList.length !== 0) {
      user = getBlockUserList[0].blockUsers;
    }

    const questionAnswered = await QueryAnswerModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
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
          from: 'query',
          localField: 'queryId',
          foreignField: '_id',
          as: 'queryData',
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
          path: '$queryData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'queryData.userId',
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
          queryUserName: '$user.name',
          queryUserCity: '$queryData.location.city',
          queryDate: '$queryData.createdAt',
          answerDate: '$createdAt',
        },
      },
      {
        $set: {
          skillAvailableOrNot: {
            $cond: {
              if: {
                $isArray: '$queryData.skill',
              },
              then: {
                $size: '$queryData.skill',
              },
              else: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'likeProfile',
          localField: 'queryData.userId',
          foreignField: 'userId',
          as: 'likeProfile',
        },
      },
      {
        $lookup: {
          from: 'workProfile',
          localField: 'queryData.userId',
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
          queryUserProfile: {
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
          path: '$queryUserProfile',
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
          questionId: '$queryData._id',
          userId: '$queryData.userId',
          question: '$queryData.question',
          answerUserName: '$answerUsers.name',
          anonymous: '$queryData.anonymous',
          queryDate: 1,
          answerDate: 1,
          queryUserCity: 1,
          answerId: '$_id',
          answer: 1,
          read: 1,
          rate: 1,
          queryUserName: 1,
          queryUserProfile: 1,
          answerUserCity: '$locationData.city',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (questionAnswered.length === 0) {
      return res.noContent();
    }

    return res.ok({
      message: 'SuccessFully Get List Of Questions That Were Answered By The Current User',
      data: questionAnswered,
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.userQuestionAsked = async (req, res) => {
  try {
    const { userId } = req;

    const [, limit, skip] = getLimitAndSkipSize(req.query.page, req.query.limit);

    const questionAsked = await QueryModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
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
          from: 'queryAnswer',
          localField: '_id',
          foreignField: 'queryId',
          as: 'queryAnswerData',
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
          'queryAnswerData.isDeleted': false,
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
                $isArray: '$queryAnswerData',
              },
              then: {
                $size: '$queryAnswerData',
              },
              else: 0,
            },
          },
          newAnswer: {
            $size: {
              $filter: {
                input: '$queryAnswerData',
                cond: {
                  $eq: ['$$this.read', false],
                },
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (questionAsked.length === 0) {
      return res.noContent();
    }

    return res.ok({
      message: 'SuccessFully Get List Of Questions That Were Asked By The Current User',
      data: questionAsked,
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.queryAnswer = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      queryValidation.queryAnswerValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { queryId, queryAnswer } = validateRequest.value;

    const { userId } = req;

    let type;

    const checkQuery = await QueryModel.findOne({ _id: queryId });

    if (!checkQuery) {
      return res.badRequest({
        message: 'Invalid QueryId',
      });
    }

    if (checkQuery.status === ACTIVE_STATUS.EXPIRED) {
      return res.badRequest({
        message: 'Query is Expired',
      });
    }

    if (userId.toString() === checkQuery.userId.toString()) {
      return res.badRequest({ message: 'You can not answer your Query yourself' });
    }

    if (checkQuery.skill.length > 0) {
      type = PROFILE_TYPE.WORK;
    } else if (checkQuery.interest.length > 0) {
      type = PROFILE_TYPE.LIKE;
    }

    const checkQueryAnswer = await QueryAnswerModel.findOne({
      userId,
      queryId,
    });

    if (checkQueryAnswer) {
      return res.badRequest({
        message: 'Already given answer this question',
      });
    }
    const userQueryAnswer = await QueryAnswerModel({
      userId,
      queryId,
      answer: queryAnswer,
    });
    await userQueryAnswer.save();

    const nameAndProfile = await multiUserNameAndProfileGet([req.userId], type);

    const { userName, profile } = nameAndProfile[0];
    const { fcmToken } = await UsersModel.findById({ _id: checkQuery.userId });
    const queryAnswerNotification = {
      userId: checkQuery.userId,
      notificationType: NOTIFICATION_TYPE.QUERY,
      text: `${userName} Answered Your Question. ${checkQuery.question}`,
      data: {
        user_id: req.userId,
        name: userName,
        profile_image: profile,
        message: queryAnswer,
        notification_type: NOTIFICATION_TYPE.QUERY,
      },
    };

    const notificationCreate = await createNotification(queryAnswerNotification);

    await notification(notificationCreate);

    const socket = getSocketServer(undefined);
    if (!socket) {
      return;
    }
    const body = `${userName} Answered Your Question. ${checkQuery.question}`;
    await sendFcmNotification(
      socket,
      queryAnswerNotification,
      [fcmToken],
      'QUERY_ANSWER',
      body,
      NOTIFICATION_TYPE.QUERY,
    );

    return res.ok({
      message: 'SuccessFully Answered For Query..',
      data: userQueryAnswer,
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.addQuery = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      queryValidation.commonQueryValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { question, skill, interest, anonymous } = validateRequest.value;

    const { userId } = req;

    const obj = await checkSkillIdOrInterestId(skill, interest, userId, question, anonymous);
    const queryCreate = new QueryModel(obj);
    await queryCreate.save();

    return res.ok({ message: 'SuccessFully Create Query..', data: queryCreate });
  } catch (err) {
    if (err?.errorType) {
      return res.badRequest({ message: err.message });
    }
    return res.failureResponse();
  }
};

exports.queryUpdate = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.badRequest({ message: 'Invalid Id' });
    }

    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      queryValidation.commonQueryValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { question, skill, interest, anonymous } = validateRequest.value;

    const { userId } = req;

    const isExitsQueryOrNot = await QueryModel.findById({
      _id: req.params.id,
    });

    if (!isExitsQueryOrNot) {
      return res.badRequest({ message: 'Query Data Not Found..' });
    }
    if (isExitsQueryOrNot.status === ACTIVE_STATUS.EXPIRED) {
      return res.badRequest({ message: 'Query Is Expired..' });
    }

    const obj = await checkSkillIdOrInterestId(skill, interest, userId, question, anonymous);
    await QueryModel.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: obj,
      },
    );

    return res.ok({ message: 'SuccessFully Update Query..' });
  } catch (err) {
    if (err?.errorType) {
      return res.badRequest({ message: err.message });
    }
    return res.failureResponse();
  }
};

exports.queryAnswerRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.query.answerId)) {
      return res.badRequest({ message: 'Invalid AnswerId' });
    }

    const isExitsQueryAnswer = await QueryAnswerModel.findOne({ _id: req.query.answerId });

    if (!isExitsQueryAnswer) {
      return res.badRequest({ message: 'Answer Not Found...' });
    }

    await QueryAnswerModel.findOneAndUpdate({ _id: req.query.answerId }, { $set: { read: true } });

    return res.ok({ message: 'SuccessFully Read Answer.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.queryPause = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.queryId)) {
      return res.badRequest({ message: 'Invalid QueryId' });
    }

    const isExitsQuery = await QueryModel.findOne({
      _id: req.query.queryId,
      userId: mongoose.Types.ObjectId(userId),
      status: { $not: { $eq: ACTIVE_STATUS.EXPIRED } },
    });

    if (!isExitsQuery) {
      return res.badRequest({ message: 'Query Not Found Or Expired...' });
    }

    await QueryModel.findByIdAndUpdate(
      { _id: req.query.queryId },
      { $set: { status: ACTIVE_STATUS.PAUSED } },
    );

    return res.ok({ message: 'SuccessFully Query Paused.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.queryResume = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.queryId)) {
      return res.badRequest({ message: 'Invalid QueryId' });
    }

    const isExitsQuery = await QueryModel.findOne({
      _id: req.query.queryId,
      userId: mongoose.Types.ObjectId(userId),
      status: { $not: { $eq: ACTIVE_STATUS.EXPIRED } },
    });

    if (!isExitsQuery) {
      return res.badRequest({ message: 'Query Not Found Or Expired...' });
    }

    await QueryModel.findByIdAndUpdate(
      { _id: req.query.queryId },
      { $set: { status: ACTIVE_STATUS.ACTIVE } },
    );

    return res.ok({ message: 'SuccessFully Query Resumed.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.queryClose = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.queryId)) {
      return res.badRequest({ message: 'Invalid QueryId' });
    }

    const isExitsQuery = await QueryModel.findOne({
      _id: req.query.queryId,
      userId: mongoose.Types.ObjectId(userId),
    });

    if (!isExitsQuery) {
      return res.badRequest({ message: 'Query Not Found...' });
    }

    await QueryModel.findByIdAndUpdate(
      { _id: req.query.queryId },
      { $set: { status: ACTIVE_STATUS.EXPIRED } },
    );

    const findChatRooms = await ChatRoomsModel.find({
      postId: new mongoose.Types.ObjectId(req.query.queryId),
    });

    if (findChatRooms.length > 0) {
      await ChatRoomsModel.updateMany(
        { postId: new mongoose.Types.ObjectId(req.query.queryId) },
        { $set: { isDeleted: true } },
      );
    }

    const chatRoomListForDeleteChat = await ChatRoomsModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(req.query.queryId),
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

    return res.ok({ message: 'SuccessFully Query Close.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.initiateChatWithUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.badRequest({ message: 'Invalid Id Only Valid ObjectId' });
    }

    const getAnswerData = await QueryAnswerModel.findById({ _id: req.params.id });
    if (!getAnswerData) {
      return res.badRequest({ message: 'Invalid Id Answer Not Found' });
    }
    const currentUser = req.userId;
    const { userId, queryId } = getAnswerData;
    const getQueryData = await QueryModel.findOne({ _id: queryId });

    let profileType = PROFILE_TYPE.LIKE;
    if (getQueryData.skill.length > 0) {
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
      queryId,
      members,
      CHAT_TAGS.QUERY,
      CHAT_TYPE.THREADS,
      profileType,
    );

    return res.ok({
      message: 'SuccessFully Initiate Chat With User..',
      data: {
        chatData: chatRoomData,
        queryData: {
          ...getQueryData._doc,
          userName: getCurrentUserDataGet[0].userName,
          profile: getCurrentUserDataGet[0].profile,
        },
        queryAnswerData: {
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

exports.queryIgnore = async (req, res) => {
  try {
    const { userId } = req;
    const { queryId } = req.query;
    if (!isValidObjectId(queryId)) {
      return res.badRequest({ message: 'Invalid QueryId' });
    }
    const isExitsQuery = await QueryModel.findById({ _id: queryId });
    if (!isExitsQuery) {
      return res.badRequest({ message: 'Query Not Found...' });
    }

    const expiryDate = new Date().setDate(new Date().getDate() + 7);
    const createIgnoreQuery = new QuerySkipModel({
      queryId,
      userId,
      expiryDate,
    });
    await createIgnoreQuery.save();
    return res.ok({ message: 'SuccessFully Query Ignore.' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.answeredRate = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      queryValidation.validQueryAnsweredRateDetails,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { answerId, id } = req.params;
    const { userId } = req;
    let type;
    const getAnswered = await isValidQueryAnswerId(answerId, id);

    if (!getAnswered) {
      return res.badRequest({ message: 'Answer Not Found..' });
    }

    const checkOwnerOrNot = await QueryModel.findById({ _id: id });
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

    const queryRateUpdate = await QueryAnswerModel.findByIdAndUpdate(
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

    const { fcmToken } = await UsersModel.findById({ _id: queryRateUpdate.userId });

    const answerRatingNotification = {
      userId: queryRateUpdate.userId,
      notificationType: NOTIFICATION_TYPE.QUERY,
      text: `${userName} Given Your Answered Question ${queryRateUpdate.rate} Rate.`,
      data: {
        user_id: req.userId,
        name: userName,
        profile_image: profile,
        message: validateRequest.value.rate,
        notification_type: NOTIFICATION_TYPE.QUERY,
      },
    };

    const notificationCreate = await createNotification(answerRatingNotification);

    await notification(notificationCreate);

    const socket = getSocketServer(undefined);
    if (!socket) {
      return;
    }
    const body = `${userName} Given Your Answered Question ${queryRateUpdate.rate} Rate.`;
    await sendFcmNotification(
      socket,
      answerRatingNotification,
      [fcmToken],
      'QUERY_RATE',
      body,
      NOTIFICATION_TYPE.QUERY,
    );

    return res.ok({
      message: 'SuccessFull..',
    });
  } catch (error) {
    if (error?.errorType) {
      return res.badRequest({ message: error.message });
    }
    return res.failureResponse();
  }
};

exports.queryDelete = async (req, res) => {
  try {
    const { userId } = req;

    if (!isValidObjectId(req.query.queryId)) {
      return res.badRequest({ message: 'Invalid QueryId' });
    }

    const isExitsQuery = await QueryModel.findOne({
      _id: req.query.queryId,
      userId: mongoose.Types.ObjectId(userId),
    });

    if (!isExitsQuery) {
      return res.badRequest({ message: 'Query Not Found...' });
    }

    if (isExitsQuery.isDeleted === true) {
      return res.badRequest({ message: 'Query Not Found...' });
    }

    await QueryModel.findByIdAndUpdate({ _id: req.query.queryId }, { $set: { isDeleted: true } });

    await QueryAnswerModel.updateMany(
      { needId: mongoose.Types.ObjectId(req.query.queryId) },
      { $set: { isDeleted: true } },
    );

    const findChatRooms = await ChatRoomsModel.find({
      postId: new mongoose.Types.ObjectId(req.query.queryId),
    });

    if (findChatRooms.length > 0) {
      await ChatRoomsModel.updateMany(
        { postId: new mongoose.Types.ObjectId(req.query.queryId) },
        { $set: { isDeleted: true } },
      );
    }

    const chatRoomListForDeleteChat = await ChatRoomsModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(req.query.queryId),
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

    return res.ok({ message: 'SuccessFully Query Delete.' });
  } catch (err) {
    return res.failureResponse();
  }
};

