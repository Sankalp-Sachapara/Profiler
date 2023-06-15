const LocationModel = require('../../../model/locationModel');
const validation = require('../../../utils/validateRequest');
const { validUserSearch } = require('../../../utils/validation/userValidation');
const { getLimitAndSkipSize } = require('../../../utils/common');

exports.userListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validUserSearch);

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
      match = { 'userData.name': userName };
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
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: false,
        },
      },
      { $match: match },
      { $skip: skip },
      { $limit: limit },
    );

    const getList = await LocationModel.aggregate(aggregate);
    return res.ok({ message: 'SuccessFully Get User List', data: getList });
  } catch (error) {
    return res.failureResponse();
  }
};

