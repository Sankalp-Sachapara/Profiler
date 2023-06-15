const { default: mongoose } = require('mongoose');
const validation = require('../../../utils/validateRequest');
const SavedModel = require('../../../model/savedModel');
const {
  validSavedDetails,
  validSavedSearch,
} = require('../../../utils/validation/savedValidation');
const { SAVED_TYPE } = require('../../../utils/constant');
const { getLimitAndSkipSize, getBlockUser } = require('../../../utils/common');

const getSavedData = async (userId, savedType, limit, skip, userName, city) => {
  const and = [{}];

  const blockUserList = await getBlockUser(userId);
  let user = [];
  if (blockUserList && blockUserList.length !== 0) {
    user = blockUserList[0].blockUsers;
  }

  if (savedType === SAVED_TYPE.LIKE) {
    if (userName !== undefined) {
      and.push({
        'likeProfileData.userName': userName,
      });
    }
    if (city !== undefined) {
      and.push({
        'likeProfileData.city': city,
      });
    }

    return SavedModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: savedType,
        },
      },
      {
        $lookup: {
          from: 'likeProfile',
          localField: 'objectId',
          foreignField: '_id',
          as: 'likeProfileData',
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
                from: 'locations',
                localField: 'userId',
                foreignField: 'userId',
                as: 'locationData',
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
                    $lookup: {
                      from: 'interestCategory',
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'interestCategoryData',
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
                    $project: {
                      name: 1,
                      icon: 1,
                      categoryId: 1,
                      interestCategoryData: 1,
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
          path: '$likeProfileData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$likeProfileData.userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$likeProfileData.locationData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'likeProfileData.userName': '$likeProfileData.userData.name',
          'likeProfileData.city': '$likeProfileData.locationData.city',
        },
      },
      {
        $unset: ['likeProfileData.userData', 'likeProfileData.locationData'],
      },
      {
        $match: {
          $and: and,
          'likeProfileData.userId': {
            $nin: user,
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
  }
  if (savedType === SAVED_TYPE.WORK) {
    if (userName !== undefined) {
      and.push({
        'workProfileData.userName': userName,
      });
    }
    if (city !== undefined) {
      and.push({
        'workProfileData.city': city,
      });
    }

    return SavedModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: savedType,
        },
      },
      {
        $lookup: {
          from: 'workProfile',
          localField: 'objectId',
          foreignField: '_id',
          as: 'workProfileData',
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
                from: 'locations',
                localField: 'userId',
                foreignField: 'userId',
                as: 'locationData',
              },
            },
            {
              $lookup: {
                from: 'skills',
                localField: 'skills',
                foreignField: '_id',
                as: 'skillData',
                pipeline: [
                  {
                    $lookup: {
                      from: 'skillCategory',
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'skillCategoryData',
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
                    $project: {
                      name: 1,
                      icon: 1,
                      categoryId: 1,
                      skillCategoryData: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: 'industryTypes',
                localField: 'industryType',
                foreignField: '_id',
                as: 'industryTypeData',
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      icon: 1,
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
          path: '$workProfileData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$workProfileData.industryTypeData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfileData.userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfileData.locationData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'workProfileData.userName': '$workProfileData.userData.name',
          'workProfileData.city': '$workProfileData.locationData.city',
        },
      },
      {
        $unset: ['workProfileData.userData', 'workProfileData.locationData'],
      },
      {
        $match: {
          $and: and,
          'workProfileData.userId': {
            $nin: user,
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
  }
  if (savedType === SAVED_TYPE.NEED) {
    if (userName !== undefined) {
      and.push({
        'needData.userName': userName,
      });
    }
    if (city !== undefined) {
      and.push({
        'needData.city': city,
      });
    }

    return SavedModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: savedType,
        },
      },
      {
        $lookup: {
          from: 'need',
          localField: 'objectId',
          foreignField: '_id',
          as: 'needData',
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
                from: 'locations',
                localField: 'userId',
                foreignField: 'userId',
                as: 'locationData',
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
                    $lookup: {
                      from: 'skillCategory',
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'skillCategoryData',
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
                    $project: {
                      name: 1,
                      icon: 1,
                      categoryId: 1,
                      skillCategoryData: 1,
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
                    $lookup: {
                      from: 'interestCategory',
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'interestCategoryData',
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
                    $project: {
                      name: 1,
                      icon: 1,
                      categoryId: 1,
                      interestCategoryData: 1,
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
          path: '$needData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$needData.userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$needData.locationData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'needData.userName': '$needData.userData.name',
          'needData.city': '$needData.locationData.city',
        },
      },
      {
        $unset: ['needData.userData', 'needData.locationData'],
      },
      {
        $match: {
          $and: and,
          'needData.userId': {
            $nin: user,
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
  }
  if (savedType === SAVED_TYPE.QUERY) {
    if (userName !== undefined) {
      and.push({
        'queryData.userName': userName,
      });
    }
    if (city !== undefined) {
      and.push({
        'queryData.city': city,
      });
    }

    return SavedModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: savedType,
        },
      },
      {
        $lookup: {
          from: 'query',
          localField: 'objectId',
          foreignField: '_id',
          as: 'queryData',
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
                from: 'locations',
                localField: 'userId',
                foreignField: 'userId',
                as: 'locationData',
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
                    $lookup: {
                      from: 'skillCategory',
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'skillCategoryData',
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
                    $project: {
                      name: 1,
                      icon: 1,
                      categoryId: 1,
                      skillCategoryData: 1,
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
                    $lookup: {
                      from: 'interestCategory',
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'interestCategoryData',
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
                    $project: {
                      name: 1,
                      icon: 1,
                      categoryId: 1,
                      interestCategoryData: 1,
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
          path: '$queryData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$queryData.userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$queryData.locationData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'queryData.userName': '$queryData.userData.name',
          'queryData.city': '$queryData.locationData.city',
        },
      },
      {
        $unset: ['queryData.userData', 'queryData.locationData'],
      },
      {
        $match: {
          $and: and,
          'queryData.userId': {
            $nin: user,
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
  }
};

exports.createSavedOrRemove = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, validSavedDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    const { status, objectId, type } = validateRequest.value;
    if (status) {
      const createSaved = new SavedModel({
        objectId,
        userId,
        type,
      });
      await createSaved.save();
    } else {
      await SavedModel.findOneAndDelete({ objectId, userId, type });
    }
    return res.ok({ message: 'SuccessFully Create Saved..' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.savedLikeProfileListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validSavedSearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { page, userName, city } = validateRequest.value;
    const newLimit = validateRequest.value.limit;
    const [, limit, skip] = getLimitAndSkipSize(page, newLimit);

    const getData = await getSavedData(req.userId, SAVED_TYPE.LIKE, limit, skip, userName, city);
    return res.ok({ message: 'SuccessFully Get Like Saved Profile List...!', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.savedWorkProfileListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validSavedSearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { page, userName, city } = validateRequest.value;
    const newLimit = validateRequest.value.limit;
    const [, limit, skip] = getLimitAndSkipSize(page, newLimit);

    const getData = await getSavedData(req.userId, SAVED_TYPE.WORK, limit, skip, userName, city);
    return res.ok({ message: 'SuccessFully Get Work Saved Profile List...!', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.savedQueryListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validSavedSearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { page, userName, city } = validateRequest.value;
    const newLimit = validateRequest.value.limit;
    const [, limit, skip] = getLimitAndSkipSize(page, newLimit);

    const getData = await getSavedData(req.userId, SAVED_TYPE.QUERY, limit, skip, userName, city);
    return res.ok({ message: 'SuccessFully Get Query Saved List...!', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.savedNeedListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validSavedSearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { page, userName, city } = validateRequest.value;
    const newLimit = validateRequest.value.limit;
    const [, limit, skip] = getLimitAndSkipSize(page, newLimit);

    const getData = await getSavedData(req.userId, SAVED_TYPE.NEED, limit, skip, userName, city);
    return res.ok({ message: 'SuccessFully Get Need Saved List...!', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

