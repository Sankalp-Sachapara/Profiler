const LocationModel = require('../../../model/locationModel');
const validation = require('../../../utils/validateRequest');
const { validQuerySearch } = require('../../../utils/validation/queryValidation');
const { getLimitAndSkipSize } = require('../../../utils/common');

exports.queryListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validQuerySearch);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { city, longitude, latitude, userName } = validateRequest.value;

    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );
    let match = {};
    if (userName !== undefined) {
      match = { name: userName };
    }
    const aggregate = [];

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

    aggregate.push(
      {
        $lookup: {
          from: 'query',
          localField: 'userId',
          foreignField: 'userId',
          as: 'queryData',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userData',
                pipeline: [
                  {
                    $match: match,
                  },
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
                localField: 'skill',
                foreignField: '_id',
                as: 'skillsData',
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$queryData.userData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $set: {
          userData: '$queryData.userData',
        },
      },
      {
        $unset: ['queryData.userData'],
      },
      {
        $group: {
          _id: '$_id',
          userId: {
            $first: '$userId',
          },
          location: {
            $first: '$location',
          },
          city: {
            $first: '$city',
          },
          state: {
            $first: '$state',
          },
          country: {
            $first: '$country',
          },
          altitude: {
            $first: '$altitude',
          },
          airPressure: {
            $first: '$airPressure',
          },
          createdAt: {
            $first: '$createdAt',
          },
          updatedAt: {
            $first: '$updatedAt',
          },
          distance: {
            $first: '$distance',
          },
          userData: {
            $first: '$userData',
          },
          queryData: {
            $push: '$queryData',
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    );

    const getList = await LocationModel.aggregate(aggregate);
    return res.ok({ message: 'SuccessFully Get Query List', data: getList });
  } catch (error) {
    return res.failureResponse();
  }
};

