/**
 * blockController.js
 * @description :: exports user block methods
 */

const { default: mongoose } = require('mongoose');
const { userBlockValidation } = require('../../../utils/validation/blockValidation');
const validation = require('../../../utils/validateRequest');
const BlockModel = require('../../../model/blockModel');
const UsersModel = require('../../../model/usersModel');
const { ROOM_TYPE } = require('../../../utils/constant');
const ChatRoomsModel = require('../../../model/chatRoomModel');
const { userBothProfile } = require('./profileController');
const { getBlockUser } = require('../../../utils/common');

exports.userBlock = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, userBlockValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { userId } = validateRequest.value;

    const blockUserExistsOrNot = await UsersModel.findOne({
      _id: mongoose.Types.ObjectId(userId),
    });

    if (!blockUserExistsOrNot) {
      return res.badRequest({ message: 'Invalid block userId' });
    }

    if (userId === req.userId.toString()) {
      return res.badRequest({ message: 'You Can Not Block Your Self' });
    }

    const checkOppositeUserBlockYou = await BlockModel.findOne({
      userId: mongoose.Types.ObjectId(userId),
      blockUserId: mongoose.Types.ObjectId(req.userId),
    });

    if (checkOppositeUserBlockYou) {
      return res.badRequest({
        message: 'User already blocked',
      });
    }

    const userBlockOrNot = await BlockModel.findOne({
      userId: mongoose.Types.ObjectId(req.userId),
      blockUserId: mongoose.Types.ObjectId(userId),
    });

    if (userBlockOrNot) {
      return res.badRequest({ message: 'Already Block This user.' });
    }

    const createUserBlock = new BlockModel({
      userId: mongoose.Types.ObjectId(req.userId),
      blockUserId: mongoose.Types.ObjectId(userId),
    });
    await createUserBlock.save();

    await ChatRoomsModel.updateMany(
      {
        members: [mongoose.Types.ObjectId(userId), mongoose.Types.ObjectId(req.userId)],
        roomType: ROOM_TYPE.PRIVATE,
      },
      { $set: { isBlocked: true } },
    );

    return res.ok({ message: 'User Block SuccessFully', data: createUserBlock });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.userUnblock = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, userBlockValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { userId } = validateRequest.value;

    const blockUserExistsOrNot = await UsersModel.findOne({
      _id: mongoose.Types.ObjectId(userId),
    });

    if (!blockUserExistsOrNot) {
      return res.badRequest({ message: 'Invalid block userId' });
    }

    if (userId === req.userId) {
      return res.badRequest({ message: 'You Can Not UnBlock Your Self' });
    }

    const userBlockOrNot = await BlockModel.findOne({
      userId: mongoose.Types.ObjectId(req.userId),
      blockUserId: mongoose.Types.ObjectId(userId),
    });

    if (!userBlockOrNot) {
      return res.badRequest({ message: 'User already unblocked' });
    }

    await BlockModel.deleteOne({
      userId: mongoose.Types.ObjectId(req.userId),
      blockUserId: mongoose.Types.ObjectId(userId),
    });

    await ChatRoomsModel.updateMany(
      {
        members: [mongoose.Types.ObjectId(userId), mongoose.Types.ObjectId(req.userId)],
        roomType: ROOM_TYPE.PRIVATE,
      },
      { $set: { isBlocked: false } },
    );

    return res.ok({ message: 'User Unblock SuccessFully' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.blockUserList = async (req, res) => {
  try {
    const { userId } = req;

    const blockUserList = await getBlockUser(userId);

    if (blockUserList.length === 0) {
      return res.badRequest({ message: 'you Do not Have Block List' });
    }

    const { blockUsers } = blockUserList[0];

    const getAllBlockUserProfile = await userBothProfile(blockUsers);

    return res.ok({
      message: 'successFully Get Block User Profiles.',
      data: getAllBlockUserProfile,
    });
  } catch (err) {
    return res.failureResponse();
  }
};

