const { default: mongoose } = require('mongoose');
const validation = require('../../../utils/validateRequest');
const LikeProfileModel = require('../../../model/likeProfileModel');
const WorkProfileModel = require('../../../model/workProfileModel');
const UsersModel = require('../../../model/usersModel');
const needModel = require('../../../model/needModel');
const queryModel = require('../../../model/queryModel');
const LocationModel = require('../../../model/locationModel');
const BlockModel = require('../../../model/blockModel');
const {
  validWorkSearchDetails,
  validLikeSearchDetails,
  validNeedOrQuerySearchDetails,
  validProfileSearchDetails,
} = require('../../../utils/validation/feedsValidation');
const { getLimitAndSkipSize } = require('../../../utils/common');
const { CONNECTION_STATUS, EXPERIENCE_TYPE, ACTIVE_STATUS } = require('../../../utils/constant');
const InterestsModel = require('../../../model/interestModel');
const SkillsModel = require('../../../model/skillModel');
const { answeredForNeed } = require('./needController');

const getUserCurrentLocation = async (userId, city, radius) => {
  const getLocationForCurrentUser = await LocationModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'userSettings',
        localField: 'userId',
        foreignField: 'userId',
        as: 'setting',
      },
    },
    {
      $unwind: {
        path: '$setting',
        preserveNullAndEmptyArrays: false,
      },
    },
  ]);
  const userSettingLocationData = getLocationForCurrentUser[0].setting.location;
  let locationFilter = {
    state: getLocationForCurrentUser[0].state,
  };

  if (userSettingLocationData.withinCountry) {
    locationFilter = {
      country: getLocationForCurrentUser[0].country,
    };
  }
  let geoNearData = {
    near: {
      type: 'Point',
      coordinates: [
        getLocationForCurrentUser[0].location.coordinates[0],
        getLocationForCurrentUser[0].location.coordinates[1],
      ],
    },
    distanceField: 'distance',
    query: locationFilter,
    spherical: true,
    distanceMultiplier: 1 / 1000,
  };

  if (city) {
    locationFilter = { city, ...locationFilter };
    geoNearData = {
      ...geoNearData,
      query: locationFilter,
    };
  }
  if (radius) {
    geoNearData = {
      ...geoNearData,
      maxDistance: radius * 1000,
    };
  }
  return { geoNearData };
};

const loginUserAllBlockUserGet = async (userId) => {
  const allBlockUser = await BlockModel.aggregate([
    {
      $match: {
        $or: [
          {
            userId: new mongoose.Types.ObjectId(userId),
          },
          {
            blockUserId: new mongoose.Types.ObjectId(userId),
          },
        ],
      },
    },
    {
      $set: {
        users: {
          $cond: {
            if: {
              $eq: ['$userId', new mongoose.Types.ObjectId(userId)],
            },
            then: '$blockUserId',
            else: '$userId',
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        blockUser: {
          $push: '$users',
        },
      },
    },
    {
      $unset: ['_id'],
    },
  ]);

  const userBlock = allBlockUser.length === 0 ? [] : allBlockUser[0].blockUser;

  userBlock.push(mongoose.Types.ObjectId(userId));
  return userBlock;
};

const getSkillOrInterestCategory = async (skillOrInterestId) => {
  let category = await skillOrInterestId.map(async (ele) => {
    const checkInterestId = await InterestsModel.findById({
      _id: mongoose.Types.ObjectId(ele),
    });

    if (checkInterestId) {
      return checkInterestId.categoryId;
    }

    const checkSkillId = await SkillsModel.findById({
      _id: mongoose.Types.ObjectId(ele),
    });

    if (checkSkillId) {
      return checkSkillId.categoryId;
    }
  });

  category = await Promise.all(category);
  return category;
};

const getSkillOrInterest = async (skillOrInterestId) => {
  let category = await skillOrInterestId.map(async (ele) => {
    const checkInterestId = await InterestsModel.findById({
      _id: mongoose.Types.ObjectId(ele),
    });

    if (checkInterestId) {
      return checkInterestId._id;
    }

    const checkSkillId = await SkillsModel.findById({
      _id: mongoose.Types.ObjectId(ele),
    });

    if (checkSkillId) {
      return checkSkillId._id;
    }
  });

  category = await Promise.all(category);
  return category;
};

exports.feedsWorkSearch = async (req, res) => {
  try {
    const skills = [];
    const languages = [];
    const industries = [];

    if (req.query.skill) {
      skills.push(req.query.skill);
    }
    if (req.query.language) {
      languages.push(req.query.language);
    }
    if (req.query.industry) {
      industries.push(req.query.industry);
    }

    const obj = {
      skill: skills.flat(),
      language: languages.flat(),
      industry: industries.flat(),
      radius: req.query.radius,
      experience: req.query.experience,
      experienceType: req.query.experienceType,
      city: req.query.city,
      openToWork: req.query.openToWork,
      page: req.query.page,
      limit: req.query.limit,
      name: req.query.name,
    };
    const validateRequest = validation.validateParamsWithJoi(obj, validWorkSearchDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    let { skill, language, industry, name } = validateRequest.value;
    const { radius, city, openToWork, experience, experienceType } = validateRequest.value;

    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );
    const { geoNearData } = await getUserCurrentLocation(userId, city, radius);

    const getCurrentUserWorkData = await WorkProfileModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!getCurrentUserWorkData) {
      return res.badRequest({ message: 'Sorry You have Not Work Profile' });
    }

    const getCurrentUserLanguageData = await UsersModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'languages',
          localField: 'language',
          foreignField: '_id',
          as: 'languageData',
        },
      },
      {
        $unwind: {
          path: '$languageData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$_id',
          language: {
            $push: '$languageData.name',
          },
        },
      },
    ]);

    const arr = [];
    if (skill.length > 0) {
      skill = await getSkillOrInterestCategory(skill);

      arr.push({
        'workProfileData.skillsData.categoryId': {
          $in: skill,
        },
      });
    }
    if (language.length === 0) {
      language = getCurrentUserLanguageData[0].language;
    }
    if (industry.length > 0) {
      industry = await industry.map((ele) => mongoose.Types.ObjectId(ele));

      arr.push({
        'workProfileData.industryData._id': {
          $in: industry,
        },
      });
    }

    arr.push({
      'userData.languageData.name': {
        $in: language,
      },
    });

    if (openToWork !== undefined) {
      arr.push({
        'workProfileData.openToWork': openToWork,
      });
    }

    if (experience !== -1) {
      if (experienceType === EXPERIENCE_TYPE.GT) {
        arr.push({
          'workProfileData.experience': { $gt: experience },
        });
      } else {
        arr.push({
          'workProfileData.experience': { $lt: experience },
        });
      }
    }

    if (name) {
      arr.push({
        'userData.name': { $regex: name, $options: 'i' },
      });
    }

    const allBlockUser = await loginUserAllBlockUserGet(userId);

    const getWorkData = await LocationModel.aggregate([
      {
        $geoNear: geoNearData,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                language: 1,
              },
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
                    },
                  },
                ],
              },
            },
            {
              $unset: ['language'],
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
      {
        $lookup: {
          from: 'workProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'workProfileData',
          pipeline: [
            {
              $lookup: {
                from: 'userSettings',
                localField: 'userId',
                foreignField: 'userId',
                as: 'userSettingsData',
                pipeline: [
                  {
                    $match: {
                      'profileStatus.work': true,
                      incognitoMode: false,
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
              },
            },
            {
              $lookup: {
                from: 'saved',
                localField: '_id',
                foreignField: 'objectId',
                as: 'savedData',
                pipeline: [
                  {
                    $match: {
                      userId: new mongoose.Types.ObjectId(userId),
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
                as: 'industryData',
                pipeline: [
                  {
                    $project: {
                      name: 1,
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
          path: '$workProfileData.userSettingsData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$workProfileData.industryData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'workSkip',
          localField: 'workProfileData._id',
          foreignField: 'profileId',
          as: 'workSkipData',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                expiryTime: {
                  $gt: new Date(),
                },
              },
            },
          ],
        },
      },
      {
        $set: {
          'workProfileData.savedData': {
            $cond: {
              if: {
                $isArray: '$workProfileData.savedData',
              },
              then: {
                $size: '$workProfileData.savedData',
              },
              else: 0,
            },
          },
          workSkipData: {
            $cond: {
              if: {
                $isArray: '$workSkipData',
              },
              then: {
                $size: '$workSkipData',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          workSkipData: { $lt: 1 },
          $and: arr,
        },
      },
      {
        $lookup: {
          from: 'connectionRequest',
          localField: 'userId',
          foreignField: 'receiverId',
          as: 'connection',
          pipeline: [
            {
              $match: {
                senderId: new mongoose.Types.ObjectId(userId),
                status: {
                  $in: [CONNECTION_STATUS.ACCEPTED, CONNECTION_STATUS.PENDING],
                },
              },
            },
          ],
        },
      },
      {
        $set: {
          connection: {
            $cond: {
              if: {
                $isArray: '$connection',
              },
              then: {
                $size: '$connection',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          connection: 0,
          userId: { $nin: allBlockUser },
        },
      },
      {
        $project: {
          workId: '$workProfileData._id',
          jobRole: '$workProfileData.jobRole',
          saved: {
            $cond: {
              if: {
                $gt: ['$workProfileData.savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          userName: '$userData.name',
          userId: 1,
          languages: '$userData.languageData',
          skills: '$workProfileData.skillsData',
          profile: '$workProfileData.images',
          aboutMe: '$workProfileData.aboutMe',
          city: 1,
          industry: '$workProfileData.industryData',
          experience: '$workProfileData.experience',
        },
      },
      { $unset: ['_id'] },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (getWorkData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully Work Search..', data: getWorkData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.feedsLikeSearch = async (req, res) => {
  try {
    const interests = [];
    const languages = [];
    if (req.query.interest) {
      interests.push(req.query.interest);
    }
    if (req.query.language) {
      languages.push(req.query.language);
    }

    const obj = {
      interest: interests.flat(),
      language: languages.flat(),
      radius: req.query.radius,
      city: req.query.city,
      page: req.query.page,
      limit: req.query.limit,
      name: req.query.name,
    };
    const validateRequest = validation.validateParamsWithJoi(obj, validLikeSearchDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    let { interest, language } = validateRequest.value;
    const { radius, city, name } = validateRequest.value;

    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );

    const { geoNearData } = await getUserCurrentLocation(userId, city, radius);

    const getCurrentUserInterestsData = await LikeProfileModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!getCurrentUserInterestsData) {
      return res.badRequest({ message: 'Sorry You have Not Like Profile' });
    }

    const getCurrentUserLanguageData = await UsersModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'languages',
          localField: 'language',
          foreignField: '_id',
          as: 'languageData',
        },
      },
      {
        $unwind: {
          path: '$languageData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$_id',
          language: {
            $push: '$languageData.name',
          },
        },
      },
    ]);
    const arr = [];
    if (interest.length > 0) {
      interest = await getSkillOrInterestCategory(interest);

      arr.push({
        'likeProfileData.interestsData.categoryId': {
          $in: interest,
        },
      });
    }
    if (language.length === 0) {
      language = getCurrentUserLanguageData[0].language;
    }

    if (name) {
      arr.push({
        'userData.name': { $regex: name, $options: 'i' },
      });
    }

    arr.push({
      'userData.languageData.name': {
        $in: language,
      },
    });

    const allBlockUser = await loginUserAllBlockUserGet(userId);

    const getLikeData = await LocationModel.aggregate([
      {
        $geoNear: geoNearData,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                language: 1,
              },
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
                    },
                  },
                ],
              },
            },
            {
              $unset: ['language'],
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
      {
        $lookup: {
          from: 'likeProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'likeProfileData',
          pipeline: [
            {
              $lookup: {
                from: 'userSettings',
                localField: 'userId',
                foreignField: 'userId',
                as: 'userSettingsData',
                pipeline: [
                  {
                    $match: {
                      'profileStatus.likeMinded': true,
                      incognitoMode: false,
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
                as: 'interestsData',
              },
            },
            {
              $lookup: {
                from: 'saved',
                localField: '_id',
                foreignField: 'objectId',
                as: 'savedData',
                pipeline: [
                  {
                    $match: {
                      userId: new mongoose.Types.ObjectId(userId),
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
          path: '$likeProfileData.userSettingsData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'likeSkip',
          localField: 'likeProfileData._id',
          foreignField: 'profileId',
          as: 'likeSkipData',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                expiryTime: {
                  $gt: new Date(),
                },
              },
            },
          ],
        },
      },
      {
        $set: {
          'likeProfileData.savedData': {
            $cond: {
              if: {
                $isArray: '$likeProfileData.savedData',
              },
              then: {
                $size: '$likeProfileData.savedData',
              },
              else: 0,
            },
          },
          likeSkipData: {
            $cond: {
              if: {
                $isArray: '$likeSkipData',
              },
              then: {
                $size: '$likeSkipData',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          likeSkipData: {
            $lt: 1,
          },
          $and: arr,
        },
      },
      {
        $lookup: {
          from: 'connectionRequest',
          localField: 'userId',
          foreignField: 'receiverId',
          as: 'connection',
          pipeline: [
            {
              $match: {
                senderId: new mongoose.Types.ObjectId(userId),
                status: {
                  $in: [CONNECTION_STATUS.ACCEPTED, CONNECTION_STATUS.PENDING],
                },
              },
            },
          ],
        },
      },
      {
        $set: {
          connection: {
            $cond: {
              if: {
                $isArray: '$connection',
              },
              then: {
                $size: '$connection',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          connection: 0,
          userId: { $nin: allBlockUser },
        },
      },
      {
        $project: {
          jobRole: '$workProfileData.jobRole',
          likeId: '$likeProfileData._id',
          saved: {
            $cond: {
              if: {
                $gt: ['$likeProfileData.savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          userName: '$userData.name',
          aboutMe: '$likeProfileData.aboutMe',
          userId: 1,
          languages: '$userData.languageData',
          interests: '$likeProfileData.interestsData',
          profile: '$likeProfileData.images',
          city: 1,
        },
      },
      {
        $unset: ['_id'],
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (getLikeData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully Like Search..', data: getLikeData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.feedsNeedSearch = async (req, res) => {
  try {
    const skillOrInterests = [];
    if (req.query.skillOrInterest) {
      skillOrInterests.push(req.query.skillOrInterest);
    }
    const obj = {
      skillOrInterest: skillOrInterests.flat(),
      page: req.query.page,
      limit: req.query.limit,
    };
    const validateRequest = validation.validateParamsWithJoi(obj, validNeedOrQuerySearchDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    let { skillOrInterest } = validateRequest.value;
    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );
    const arr = [];
    if (skillOrInterest.length > 0) {
      skillOrInterest = await getSkillOrInterestCategory(skillOrInterest);

      arr.push({
        $or: [
          { 'skillData.categoryId': { $in: skillOrInterest } },
          { 'interestData.categoryId': { $in: skillOrInterest } },
        ],
      });
    } else {
      arr.push({});
    }

    const allBlockUser = await loginUserAllBlockUserGet(userId);

    const getData = await needModel.aggregate([
      {
        $match: {
          status: ACTIVE_STATUS.ACTIVE,
        },
      },
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
          from: 'likeProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'likeProfileData',
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
          from: 'workProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'workProfileData',
          pipeline: [
            {
              $project: {
                images: 1,
                jobRole: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$likeProfileData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfileData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'skill',
          foreignField: '_id',
          as: 'skillData',
        },
      },
      {
        $lookup: {
          from: 'interests',
          localField: 'interest',
          foreignField: '_id',
          as: 'interestData',
        },
      },
      {
        $lookup: {
          from: 'saved',
          localField: '_id',
          foreignField: 'objectId',
          as: 'savedData',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'needSkip',
          localField: '_id',
          foreignField: 'needId',
          as: 'needSkipData',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                expiryDate: {
                  $gt: new Date(),
                },
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
          as: 'locations',
          pipeline: [
            {
              $project: {
                city: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$locations',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'needAnswer',
          localField: '_id',
          foreignField: 'needId',
          as: 'needAnswer',
          pipeline: [
            {
              $match: {
                userId: mongoose.Types.ObjectId(userId),
                isDeleted: false,
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
          needSkipData: {
            $cond: {
              if: {
                $isArray: '$needSkipData',
              },
              then: {
                $size: '$needSkipData',
              },
              else: 0,
            },
          },
          needAnswer: {
            $cond: {
              if: {
                $isArray: '$needAnswer',
              },
              then: {
                $size: '$needAnswer',
              },
              else: 0,
            },
          },
          skillLength: {
            $cond: {
              if: {
                $isArray: '$skill',
              },
              then: {
                $size: '$skill',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          needSkipData: {
            $lt: 1,
          },
          isDeleted: false,
          $and: arr,
          needAnswer: 0,
          userId: { $nin: allBlockUser },
        },
      },
      {
        $project: {
          userId: 1,
          saved: {
            $cond: {
              if: {
                $gt: ['$savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          profile: {
            $cond: {
              if: {
                $gt: ['$skillLength', 0],
              },
              then: '$workProfileData',
              else: '$likeProfileData',
            },
          },
          jobRole: {
            $cond: {
              if: {
                $gt: ['$skillLength', 0],
              },
              then: '$workProfileData.jobRole',
              else: undefined,
            },
          },
          name: '$userData.name',
          verified: '$userData.verified',
          status: 1,
          question: 1,
          anonymous: 1,
          createdAt: 1,
          skillName: '$skillData',
          interestName: '$interestData',
          city: '$locations.city',
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
    return res.ok({ message: 'SuccessFully Need List Get', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.feedsQuerySearch = async (req, res) => {
  try {
    const skillOrInterests = [];
    if (req.query.skillOrInterest) {
      skillOrInterests.push(req.query.skillOrInterest);
    }
    const obj = {
      skillOrInterest: skillOrInterests.flat(),
      page: req.query.page,
      limit: req.query.limit,
    };
    const validateRequest = validation.validateParamsWithJoi(obj, validNeedOrQuerySearchDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;

    let { skillOrInterest } = validateRequest.value;
    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );
    const arr = [];
    if (skillOrInterest.length > 0) {
      skillOrInterest = await getSkillOrInterestCategory(skillOrInterest);
      arr.push({
        $or: [
          { 'skillData.categoryId': { $in: skillOrInterest } },
          { 'interestData.categoryId': { $in: skillOrInterest } },
        ],
      });
    } else {
      arr.push({});
    }

    const allBlockUser = await loginUserAllBlockUserGet(userId);

    const getData = await queryModel.aggregate([
      {
        $match: {
          status: ACTIVE_STATUS.ACTIVE,
        },
      },
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
          from: 'likeProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'likeProfileData',
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
          from: 'workProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'workProfileData',
          pipeline: [
            {
              $project: {
                images: 1,
                jobRole: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$likeProfileData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfileData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'skill',
          foreignField: '_id',
          as: 'skillData',
        },
      },
      {
        $lookup: {
          from: 'interests',
          localField: 'interest',
          foreignField: '_id',
          as: 'interestData',
        },
      },
      {
        $lookup: {
          from: 'saved',
          localField: '_id',
          foreignField: 'objectId',
          as: 'savedData',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'querySkip',
          localField: '_id',
          foreignField: 'queryId',
          as: 'querySkipData',
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                expiryDate: {
                  $gt: new Date(),
                },
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
          as: 'locations',
          pipeline: [
            {
              $project: {
                city: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$locations',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'queryAnswer',
          localField: '_id',
          foreignField: 'queryId',
          as: 'queryAnswer',
          pipeline: [
            {
              $match: {
                userId: mongoose.Types.ObjectId(userId),
                isDeleted: false,
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
          querySkipData: {
            $cond: {
              if: {
                $isArray: '$querySkipData',
              },
              then: {
                $size: '$querySkipData',
              },
              else: 0,
            },
          },
          queryAnswer: {
            $cond: {
              if: {
                $isArray: '$queryAnswer',
              },
              then: {
                $size: '$queryAnswer',
              },
              else: 0,
            },
          },
          skillLength: {
            $cond: {
              if: {
                $isArray: '$skill',
              },
              then: {
                $size: '$skill',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          querySkipData: {
            $lt: 1,
          },
          isDeleted: false,
          $and: arr,
          queryAnswer: 0,
          userId: { $nin: allBlockUser },
        },
      },
      {
        $project: {
          userId: 1,
          saved: {
            $cond: {
              if: {
                $gt: ['$savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          profile: {
            $cond: {
              if: {
                $gt: ['$skillLength', 0],
              },
              then: '$workProfileData',
              else: '$likeProfileData',
            },
          },
          jobRole: {
            $cond: {
              if: {
                $gt: ['$skillLength', 0],
              },
              then: '$workProfileData.jobRole',
              else: undefined,
            },
          },
          name: '$userData.name',
          verified: '$userData.verified',
          status: 1,
          question: 1,
          anonymous: 1,
          createdAt: 1,
          skillName: '$skillData',
          interestName: '$interestData',
          city: '$locations.city',
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
    return res.ok({ message: 'SuccessFully Query List Get', data: getData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.bothProfileSearch = async (req, res) => {
  try {
    const skills = [];
    const interests = [];
    const languages = [];
    const industries = [];

    if (req.query.skill) {
      skills.push(req.query.skill);
    }
    if (req.query.interests) {
      skills.push(req.query.interest);
    }
    if (req.query.language) {
      languages.push(req.query.language);
    }
    if (req.query.industry) {
      industries.push(req.query.industry);
    }

    const obj = {
      skill: skills.flat(),
      interest: interests.flat(),
      language: languages.flat(),
      industry: industries.flat(),
      radius: req.query.radius,
      experience: req.query.experience,
      experienceType: req.query.experienceType,
      city: req.query.city,
      openToWork: req.query.openToWork,
      page: req.query.page,
      limit: req.query.limit,
      name: req.query.name,
      keyword: req.query.keyword,
    };
    const validateRequest = validation.validateParamsWithJoi(obj, validProfileSearchDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    let { skill, language, industry, interest } = validateRequest.value;
    const { radius, city, openToWork, experience, experienceType, name, keyword } =
      validateRequest.value;

    const [, limit, skip] = getLimitAndSkipSize(
      validateRequest.value.page,
      validateRequest.value.limit,
    );

    const { geoNearData } = await getUserCurrentLocation(userId, city, radius);

    // We will have by default at least one value in the and aggregate
    let arr = [{ _id: { $ne: undefined } }];
    if (skill.length > 0) {
      skill = await getSkillOrInterest(skill);

      arr.push({
        'workProfileData.skillsData._id': {
          $in: skill,
        },
      });
    }
    if (interest.length > 0) {
      interest = await getSkillOrInterest(skill);

      arr.push({
        'likeProfileData.interestData._id': {
          $in: interest,
        },
      });
    }
    if (language.length > 0) {
      arr.push({
        'userData.languageData.name': {
          $in: language,
        },
      });
    }
    if (industry.length > 0) {
      industry = await industry.map((ele) => mongoose.Types.ObjectId(ele));

      arr.push({
        'workProfileData.industryData._id': {
          $in: industry,
        },
      });
    }

    if (openToWork !== undefined) {
      arr.push({
        'workProfileData.openToWork': openToWork,
      });
    }

    if (experience !== -1) {
      if (experienceType === EXPERIENCE_TYPE.GT) {
        arr.push({
          'workProfileData.experience': { $gt: experience },
        });
      } else {
        arr.push({
          'workProfileData.experience': { $lt: experience },
        });
      }
    }

    if (name) {
      arr.push({
        'userData.name': { $regex: name, $options: 'i' },
      });
    }

    const allBlockUser = await loginUserAllBlockUserGet(userId);

    if (keyword) {
      arr = [
        {
          $or: [
            {
              'userData.name': {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              'workProfileData.skillsData.name': {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              'likeProfileData.interestsData.name': {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              city: {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              state: {
                $regex: keyword,
                $options: 'i',
              },
            },
          ],
        },
      ];
    }
    console.log(geoNearData);
    const getWorkData = await LocationModel.aggregate([
      {
        $geoNear: geoNearData,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                language: 1,
              },
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
                    },
                  },
                ],
              },
            },
            {
              $unset: ['language'],
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
      {
        $lookup: {
          from: 'connectionRequest',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $eq: ['$senderId', '$$userId'] },
                        { $eq: ['$receiverId', '$$userId'] },
                      ],
                    },
                    {
                      $or: [
                        { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
                        { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                      ],
                    },
                  ],
                },
                isDeleted: false,
              },
            },
          ],
          as: 'connections',
        },
      },
      {
        $lookup: {
          from: 'workProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'workProfileData',
          pipeline: [
            {
              $lookup: {
                from: 'userSettings',
                localField: 'userId',
                foreignField: 'userId',
                as: 'userSettingsData',
                // pipeline: [
                //   {
                //     $match: {
                //       'profileStatus.work': true,
                //       incognitoMode: false,
                //     },
                //   },
                // ],
              },
            },
            {
              $lookup: {
                from: 'skills',
                localField: 'skills',
                foreignField: '_id',
                as: 'skillsData',
              },
            },
            {
              $lookup: {
                from: 'saved',
                localField: '_id',
                foreignField: 'objectId',
                as: 'savedData',
                pipeline: [
                  {
                    $match: {
                      userId: new mongoose.Types.ObjectId(userId),
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
                as: 'industryData',
                pipeline: [
                  {
                    $project: {
                      name: 1,
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
          from: 'likeProfile',
          localField: 'userId',
          foreignField: 'userId',
          as: 'likeProfileData',
          pipeline: [
            {
              $lookup: {
                from: 'userSettings',
                localField: 'userId',
                foreignField: 'userId',
                as: 'userSettingsData',
                // pipeline: [
                //   {
                //     $match: {
                //       'profileStatus.likeMinded': true,
                //       incognitoMode: false,
                //     },
                //   },
                // ],
              },
            },
            {
              $lookup: {
                from: 'interests',
                localField: 'interest',
                foreignField: '_id',
                as: 'interestsData',
              },
            },
            {
              $lookup: {
                from: 'saved',
                localField: '_id',
                foreignField: 'objectId',
                as: 'savedData',
                pipeline: [
                  {
                    $match: {
                      userId: new mongoose.Types.ObjectId(userId),
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfileData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$workProfileData.userSettingsData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$workProfileData.industryData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $set: {
          'workProfileData.savedData': {
            $cond: {
              if: {
                $isArray: '$workProfileData.savedData',
              },
              then: {
                $size: '$workProfileData.savedData',
              },
              else: 0,
            },
          },
          'likeProfileData.savedData': {
            $cond: {
              if: {
                $isArray: '$likeProfileData.savedData',
              },
              then: {
                $size: '$likeProfileData.savedData',
              },
              else: 0,
            },
          },
        },
      },
      {
        $match: {
          $and: arr,
        },
      },
      {
        $match: {
          userId: { $nin: allBlockUser },
        },
      },
      {
        $project: {
          jobRole: '$workProfileData.jobRole',

          userName: '$userData.name',
          userId: 1,
          city: 1,
          languages: '$userData.languageData',
          'workProfile.workId': '$workProfileData._id',
          'workProfile.skills': '$workProfileData.skillsData',
          'workProfile.profile': '$workProfileData.images',
          'workProfile.aboutMe': '$workProfileData.aboutMe',
          'workProfile.industry': '$workProfileData.industryData',
          'workProfile.experience': '$workProfileData.experience',
          'workProfile.saved': {
            $cond: {
              if: {
                $gt: ['$workProfileData.savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          'likeProfile.likeId': '$likeProfileData._id',
          'likeProfile.interests': '$likeProfileData.interestsData',
          'likeProfile.profile': '$likeProfileData.images',
          'likeProfile.aboutMe': '$likeProfileData.aboutMe',
          'likeProfile.saved': {
            $cond: {
              if: {
                $gt: ['$likeProfileData.savedData', 0],
              },
              then: true,
              else: false,
            },
          },
          Connection: {
            $cond: {
              if: { $anyElementTrue: { $map: { input: '$connections', in: '$$this.status' } } },
              then: 'CONNECTED',
              else: 'NOT CONNECTED',
            },
          },
        },
      },
      { $unset: ['_id'] },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (getWorkData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully Work Search..', data: getWorkData });
  } catch (error) {
    console.log('🚀 ~ file: feedsController.js:2016 ~ exports.workProfileSearch= ~ error:', error);
    return res.failureResponse();
  }
};
