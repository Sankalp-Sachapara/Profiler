const LocationModel = require('../../../model/locationModel');
const validation = require('../../../utils/validateRequest');
const { validProfileSearch } = require('../../../utils/validation/profileValidation');
const { getLimitAndSkipSize } = require('../../../utils/common');
const { PROFILE_TYPE } = require('../../../utils/constant');

const getProfileData = async (data, profileType) => {
  const { city, longitude, latitude, userName } = data;
  const aggregate = [];
  const [, limit, skip] = getLimitAndSkipSize(data.page, data.limit);
  let match = {};

  if (longitude !== undefined && latitude !== undefined) {
    aggregate.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        distanceField: 'distance',
        spherical: false,
      },
    });
  }

  if (city !== undefined) {
    aggregate.push({
      $match: {
        city,
      },
    });
  }

  if (PROFILE_TYPE.LIKE === profileType) {
    if (userName !== undefined) {
      match = { 'likeProfileData.userData.name': userName };
    }
    aggregate.push(
      {
        $lookup: {
          from: 'likeProfile',
          localField: 'userId',
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
                    $lookup: {
                      from: 'languages',
                      localField: 'language',
                      foreignField: '_id',
                      as: 'languageData',
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
                      pipeline: [{ $project: { name: 1 } }],
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
          preserveNullAndEmptyArrays: false,
        },
      },
      { $match: match },
      { $skip: skip },
      { $limit: limit },
    );
    return LocationModel.aggregate(aggregate);
  }
  if (userName !== undefined) {
    match = { 'workProfileData.userData.name': userName };
  }
  aggregate.push(
    {
      $lookup: {
        from: 'workProfile',
        localField: 'userId',
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
                  $lookup: {
                    from: 'languages',
                    localField: 'language',
                    foreignField: '_id',
                    as: 'languageData',
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
            $lookup: {
              from: 'skills',
              localField: 'skills',
              foreignField: '_id',
              as: 'skillsData',
              pipeline: [
                {
                  $lookup: {
                    from: 'skillCategory',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'skillCategoryData',
                    pipeline: [{ $project: { name: 1 } }],
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
        path: '$workProfileData.userData',
        preserveNullAndEmptyArrays: false,
      },
    },
    { $match: match },
    { $skip: skip },
    { $limit: limit },
  );
  return LocationModel.aggregate(aggregate);
};

exports.likeProfileListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validProfileSearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const getList = await getProfileData(validateRequest.value, PROFILE_TYPE.LIKE);

    return res.ok({ message: 'SuccessFully Get Like Profile List', data: getList });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.workProfileListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validProfileSearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const getList = await getProfileData(validateRequest.value, PROFILE_TYPE.WORK);

    return res.ok({ message: 'SuccessFully Get Work Profile List', data: getList });
  } catch (error) {
    return res.failureResponse();
  }
};

