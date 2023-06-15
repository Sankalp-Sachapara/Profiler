/**
 * notificationController.js
 * @description :: exports query method
 */

const { default: mongoose } = require('mongoose');
const notificationValidation = require('../../../utils/validation/notificationValidation');
const validation = require('../../../utils/validateRequest');
const NotificationModel = require('../../../model/notificationModel');
const { getBlockUser } = require('../../../utils/common');

const matchNotificationId = async (notification, userId) =>
  new Promise((resolve, reject) => {
    (async () => {
      let notificationData = await notification.map(async (ele) => {
        const getNotification = await NotificationModel.findOne({
          _id: ele,
          userId: mongoose.Types.ObjectId(userId),
        });

        if (!getNotification) {
          return reject({ message: 'Invalid Id', errorType: 'notification' });
        }

        return getNotification._id;
      });

      notificationData = await Promise.all(notificationData);

      resolve(notificationData);
    })();
  });

exports.notificationRead = async (req, res) => {
  try {
    const { notification } = req.body;
    const { userId } = req;

    const getNotificationId = await matchNotificationId(notification, userId);

    const updateNotification = await NotificationModel.updateMany(
      { _id: getNotificationId },
      {
        $set: { read: true },
      },
      {
        new: true,
      },
    );

    return res.ok({ message: 'SuccessFully Read Notification', data: updateNotification });
  } catch (err) {
    if (err?.errorType) {
      return res.badRequest({ message: err.message });
    }
    return res.failureResponse();
  }
};

exports.notificationGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.query,
      notificationValidation.userGetNotification,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    let { pageSize } = validateRequest.value;
    const { lastNotificationId } = validateRequest.value;

    const { userId } = req;

    if (!pageSize) {
      pageSize = 10;
    }

    let lastDate;

    if (lastNotificationId) {
      const notificationGet = await NotificationModel.findOne({
        _id: mongoose.Types.ObjectId(lastNotificationId),
        userId: mongoose.Types.ObjectId(userId),
      });

      if (!notificationGet) {
        return res.badRequest({ message: 'Invalid Id' });
      }

      lastDate = notificationGet.createdAt;
    }

    const getBlockUserList = await getBlockUser(userId);

    let user = [];
    if (getBlockUserList && getBlockUserList.length !== 0) {
      user = getBlockUserList[0].blockUsers;
    }

    const getNewNotification = await NotificationModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gt: new Date(lastDate),
          },
          'data.user_id': {
            $nin: user,
          },
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
    ]);

    if (getNewNotification.length === 0) {
      return res.noContent();
    }

    return res.ok({ message: 'SuccessFully Get New Notification', data: getNewNotification });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.createNotification = async (Obj) => {
  const addNotification = new NotificationModel(Obj);
  await addNotification.save();

  return addNotification;
};

