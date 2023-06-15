const ChatRoomsModel = require('../model/chatRoomModel');
const UsersModel = require('../model/usersModel');
const { convertObjectToEnum } = require('./common');
const { PROFILE_TYPE, ROOM_TYPE } = require('./constant');

exports.getChatRoom = async (postId, members, tag, chatType, profileType) => {
  const isExitsChatOrNot = await ChatRoomsModel.findOne({
    postId,
    members,
    roomType: ROOM_TYPE.PRIVATE,
    tag,
  });
  if (!isExitsChatOrNot) {
    const initiateChat = new ChatRoomsModel({
      postId,
      members,
      chatType,
      roomType: ROOM_TYPE.PRIVATE,
      tag,
      profileRefererType: profileType,
    });
    await initiateChat.save();
    return initiateChat;
  }
  return isExitsChatOrNot;
};

exports.multiUserNameAndProfileGet = async (members, profileType) => {
  if (profileType === PROFILE_TYPE.LIKE) {
    const getUserData = await UsersModel.aggregate([
      {
        $match: {
          _id: {
            $in: members,
          },
        },
      },
      {
        $lookup: {
          from: 'likeProfile',
          localField: '_id',
          foreignField: 'userId',
          as: 'likeData',
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
        $unwind: {
          path: '$likeData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          userName: '$name',
          profile: {
            $arrayElemAt: ['$likeData.images', 0],
          },
          fcmToken: 1,
          isOnline: 1,
          profileId: '$likeData._id',
        },
      },
    ]);
    return getUserData;
  }
  const getUserData = await UsersModel.aggregate([
    {
      $match: {
        _id: {
          $in: members,
        },
      },
    },
    {
      $lookup: {
        from: 'workProfile',
        localField: '_id',
        foreignField: 'userId',
        as: 'workData',
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
      $unwind: {
        path: '$workData',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        userName: '$name',
        profile: {
          $arrayElemAt: ['$workData.images', 0],
        },
        fcmToken: 1,
        isOnline: 1,
        profileId: '$workData._id',
      },
    },
  ]);
  return getUserData;
};

exports.getUserProfileWithPreference = async (
  userId,
  profileType,
  profileTypeList = convertObjectToEnum(PROFILE_TYPE),
) => {
  const userData = await this.multiUserNameAndProfileGet([userId], profileType);

  if (userData.length > 0) {
    return userData;
  }

  const profileList = profileTypeList.filter((e) => e !== profileType);

  if (profileList.length === 0) {
    return undefined;
  }

  return this.multiUserNameAndProfileGet([userId], profileList[0], profileList);
};

