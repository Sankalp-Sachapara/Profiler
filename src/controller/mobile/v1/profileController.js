/**
 * profileController.js
 * @description :: exports profile all method
 */

const { default: mongoose } = require('mongoose');
const { default: axios } = require('axios');
const LocationModel = require('../../../model/locationModel');
const UsersModel = require('../../../model/usersModel');
const LikeProfileModel = require('../../../model/likeProfileModel');
const WorkProfileModel = require('../../../model/workProfileModel');
const InterestsModel = require('../../../model/interestModel');
const SkillsModel = require('../../../model/skillModel');
const UserSettingsModel = require('../../../model/userSettingModel');
const EducationModel = require('../../../model/educationModel');
const QuestionsModel = require('../../../model/questionsModel');
const LanguageModel = require('../../../model/languageModel');
const IndustryTypeModel = require('../../../model/industryTypeModel');
const NotificationsModel = require('../../../model/notificationModel');
const connectionRequestModel = require('../../../model/connectionRequestModel');
const needModel = require('../../../model/needModel');
const queryModel = require('../../../model/queryModel');
const ChatRoomsModel = require('../../../model/chatRoomModel');
const chatModel = require('../../../model/chatModel');
const queryAnswerModel = require('../../../model/queryAnswermodel');
const NeedAnswerModel = require('../../../model/needAnswerModel');
const SavedModel = require('../../../model/savedModel');
const RevealModel = require('../../../model/revealModel');
const NeedSkipModel = require('../../../model/needSkipModel');
const QuerySkipModel = require('../../../model/querySkipModel');
const { uploadProfile, uploadQuestionAnswer } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const {
  validBasicProfileDetails,
  validLikeMindedProfileDetail,
  validProfessionalProfileDetail,
  validUserProfileSettingDetail,
  validUserFcmTokenAndDeviceDetails,
  validChatInitiateDetail,
  validVerifyUserImagePayload,
  validsocialLinkDetail,
  validsocialLinkCategoryIdDetail,
} = require('../../../utils/validation/profileValidation');
const { isValidObjectId } = require('../../../utils/common');
const {
  PROFILE_TYPE,
  CONNECTION_STATUS,
  PROFILE_QUESTION_ANSWER_TYPE,
  ROOM_TYPE,
  CHAT_TYPE,
} = require('../../../utils/constant');
const WorkSkipModel = require('../../../model/workSkipModel');
const LikeSkipModel = require('../../../model/likeSkipModel');
const { getChatRoom } = require('../../../utils/chatroom.common');
const SocialLinksModel = require('../../../model/socialLinkModel');
const SocialLinkCategoryModel = require('../../../model/socialLinkCategoryModel');

const imageCheckAndUpload = async (images, getProfileData, profileType) =>
  new Promise((resolve, reject) => {
    (async () => {
      let newImage = await images.map(async (ele) => {
        if (getProfileData.images.length > 0 && getProfileData.images.includes(ele)) {
          return ele;
        }
        const uploadImageInBucket = await uploadProfile(ele, profileType);
        if (!uploadImageInBucket.success) {
          return reject({ message: uploadImageInBucket.message, errorType: 'FileUpload' });
        }
        return uploadImageInBucket.path;
      });
      newImage = await Promise.all(newImage);
      resolve(newImage);
    })();
  });

const questionCheckAndUploadAudio = async (questions, getProfileData) =>
  new Promise((resolve, reject) => {
    (async () => {
      let questionAnswerData = await questions.map(async (ele) => {
        if (
          getProfileData.questions.length > 0 &&
          getProfileData.questions.some(
            (e) => e.answer === ele.answer && e.questionId.toString() === ele.questionId.toString(),
          )
        ) {
          return ele;
        }
        const isValidQuestion = await QuestionsModel.findById({ _id: ele.questionId });
        if (!isValidQuestion) {
          return reject({ message: 'Invalid QuestionId', errorType: 'Question' });
        }

        if (ele.answerType === PROFILE_QUESTION_ANSWER_TYPE.AUDIO) {
          const uploadAudioInBucket = await uploadQuestionAnswer(ele.answer);
          if (!uploadAudioInBucket.success) {
            return reject({ message: uploadAudioInBucket.message, errorType: 'FileUpload' });
          }
          return { ...ele, answer: uploadAudioInBucket.path };
        }
        return ele;
      });
      questionAnswerData = await Promise.all(questionAnswerData);
      resolve(questionAnswerData);
    })();
  });

const isValidInterestId = async (interest) =>
  new Promise((resolve, reject) => {
    (async () => {
      const interests = await interest.map(async (ele) => {
        const isExitsInterest = await InterestsModel.findById({ _id: ele });
        if (!isExitsInterest) {
          return reject({ message: 'Invalid InterestId', errorType: 'Interest' });
        }
      });
      await Promise.all(interests);
      resolve();
    })();
  });

const isValidSkillId = async (skill) =>
  new Promise((resolve, reject) => {
    (async () => {
      const skills = await skill.map(async (ele) => {
        const isExitsSkill = await SkillsModel.findById({ _id: ele });
        if (!isExitsSkill) {
          return reject({ message: 'Invalid SkillId', errorType: 'Skills' });
        }
      });
      await Promise.all(skills);
      resolve();
    })();
  });

const isValidLanguageId = async (language) =>
  new Promise((resolve, reject) => {
    (async () => {
      const languages = await language.map(async (ele) => {
        const isExitsLanguage = await LanguageModel.findById({ _id: ele });
        if (!isExitsLanguage) {
          return reject({ message: 'Invalid Language', errorType: 'Language' });
        }
      });
      await Promise.all(languages);
      resolve();
    })();
  });

const createUserSetting = async (userId) => {
  const isExitsSetting = await UserSettingsModel.findOne({ userId });
  if (!isExitsSetting) {
    const createDefaultSetting = new UserSettingsModel({
      userId,
      location: {
        withinCountry: true,
        withinState: false,
      },
      profileStatus: {
        likeMinded: true,
        work: true,
      },
      snooze: {
        oneDay: false,
        oneWeek: false,
        expiryTime: new Date(),
      },
    });
    await createDefaultSetting.save();
  }
};

const checkKeyInLikeAndWorkProfile = async (profileData) => {
  let object = {};
  const check = Object.entries(profileData);
  check.map((e) => {
    if (e[1] !== 'null') {
      if ((e[0] === 'yearOfPassOut' || e[0] === 'experience') && e[1] === -1) {
        object = { ...object };
      } else {
        object = { ...object, [e[0]]: e[1] };
      }
    }
  });
  return object;
};

exports.userBothProfile = async (allUsers) => {
  const getProfileData = await UsersModel.aggregate([
    {
      $match: {
        _id: { $in: allUsers },
      },
    },
    {
      $lookup: {
        from: 'locations',
        localField: '_id',
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
    {
      $lookup: {
        from: 'likeProfile',
        localField: '_id',
        foreignField: 'userId',
        as: 'likeProfileData',
        pipeline: [
          {
            $lookup: {
              from: 'interests',
              localField: 'interest',
              foreignField: '_id',
              as: 'interestData',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'workProfile',
        localField: '_id',
        foreignField: 'userId',
        as: 'workProfileData',
        pipeline: [
          {
            $lookup: {
              from: 'skills',
              localField: 'skills',
              foreignField: '_id',
              as: 'skillData',
            },
          },
          {
            $lookup: {
              from: 'industryTypes',
              localField: 'industryType',
              foreignField: '_id',
              as: 'industryType',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'education',
        localField: '_id',
        foreignField: 'userId',
        as: 'educationData',
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
        path: '$educationData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$workProfileData.industryType',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: [
        'isDeleted',
        'isActive',
        'provider',
        'providerId',
        'createdAt',
        'updatedAt',
        '__v',
        'locationData._id',
        'locationData.userId',
        'educationData._id',
        'educationData.userId',
        'workProfileData._id',
        'workProfileData.userId',
        'likeProfileData._id',
        'likeProfileData.userId',
      ],
    },
  ]);
  return getProfileData;
};

exports.basicProfileSetup = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, validBasicProfileDetails);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, dateOfBirth, gender, location } = validateRequest.value;

    const { userId } = req;

    const getLikeProfile = await LikeProfileModel.findOne({ userId });

    const getWorkProfile = await WorkProfileModel.findOne({ userId });

    if (!getLikeProfile && !getWorkProfile) {
      await UsersModel.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            name,
            gender,
            dateOfBirth,
          },
        },
      );
    }

    // location Added For Specific User
    const isExitsUserInLocationData = await LocationModel.findOne({
      userId,
    });
    if (isExitsUserInLocationData) {
      await LocationModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            location: { type: 'Point', coordinates: [location.longitude, location.latitude] },
            city: location.city,
            state: location.state,
            country: location.country,
            altitude: location.altitude,
            airPressure: location.airPressure,
          },
        },
      );
    } else {
      const locationAdd = new LocationModel({
        userId,
        location: { type: 'Point', coordinates: [location.longitude, location.latitude] },
        city: location.city,
        state: location.state,
        country: location.country,
        altitude: location.altitude,
        airPressure: location.airPressure,
      });
      await locationAdd.save();
    }

    // education added For Specific User
    const isExitsUserInEducationData = await EducationModel.findOne({
      userId,
    });
    if (!isExitsUserInEducationData) {
      const educationCreate = new EducationModel({
        userId,
      });
      await educationCreate.save();
    }

    // user default Setting create
    await createUserSetting(userId);

    return res.ok({ message: 'SuccessFully basic Profile setup' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.likeMindedProfileSetup = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validLikeMindedProfileDetail,
    );
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { interest, language } = validateRequest.value;
    let { questions, images } = validateRequest.value;
    const { userId } = req;

    if (images.length === 0) {
      return res.badRequest({ message: 'Image not found' });
    }

    let getUserLikeMindedData = await LikeProfileModel.findOne({ userId });
    if (!getUserLikeMindedData) {
      getUserLikeMindedData = new LikeProfileModel({
        userId,
      });
      await getUserLikeMindedData.save();
    }

    await isValidInterestId(interest);
    if (language && language.length > 0) {
      await isValidLanguageId(language);
    }

    if (questions !== 'null' && questions && questions.length > 0) {
      questions = await questionCheckAndUploadAudio(questions, getUserLikeMindedData);
    }

    images = await imageCheckAndUpload(images, getUserLikeMindedData, PROFILE_TYPE.LIKE);

    const updateData = await checkKeyInLikeAndWorkProfile(validateRequest.value);

    await LikeProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          interest,
          aboutMe: updateData.aboutMe,
          images,
          questions: updateData.questions,
          openToWork: updateData.openToWork,
        },
      },
    );

    await EducationModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          education: updateData.education,
          yearOfPassOut: updateData.yearOfPassOut,
          institution: updateData.institution,
        },
      },
    );

    await UsersModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { link: updateData.link, language } },
    );
    return res.ok({ message: 'SuccessFully LikeMinded Profile Update' });
  } catch (error) {
    if (error?.errorType) {
      return res.badRequest({ message: error.message });
    }
    return res.failureResponse();
  }
};

exports.workProfileSetup = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validProfessionalProfileDetail,
    );
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { skills, language, industryType } = validateRequest.value;
    let { questions, images } = validateRequest.value;
    const { userId } = req;

    if (images.length === 0) {
      return res.badRequest({ message: 'Image not found' });
    }

    let getUserProfessionalData = await WorkProfileModel.findOne({ userId });

    if (!getUserProfessionalData) {
      getUserProfessionalData = new WorkProfileModel({
        userId,
      });
      await getUserProfessionalData.save();
    }
    await isValidSkillId(skills);

    if (language && language.length > 0) {
      await isValidLanguageId(language);
    }

    if (industryType !== 'null' && industryType) {
      const isValidIndustryType = await IndustryTypeModel.findById({ _id: industryType });
      if (!isValidIndustryType) {
        return res.badRequest({ message: 'Invalid IndustryType' });
      }
    }

    if (questions !== 'null' && questions && questions.length > 0) {
      questions = await questionCheckAndUploadAudio(questions, getUserProfessionalData);
    }

    images = await imageCheckAndUpload(images, getUserProfessionalData, PROFILE_TYPE.WORK);

    const updateData = await checkKeyInLikeAndWorkProfile(validateRequest.value);

    const dataToUpdate = {
      skills,
      aboutMe: updateData.aboutMe,
      images,
      questions: updateData.questions,
      openToWork: updateData.openToWork,
      jobRole: updateData.jobRole,
      companyName: updateData.companyName,
      industryType: updateData.industryType,
      experience: updateData.experience,
    };

    await WorkProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...dataToUpdate,
        },
      },
    );

    await EducationModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          education: updateData.education,
          yearOfPassOut: updateData.yearOfPassOut,
          institution: updateData.institution,
        },
      },
    );

    await UsersModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { link: updateData.link, language } },
    );
    return res.ok({ message: 'SuccessFully Professional Profile Update' });
  } catch (error) {
    console.log(error);
    if (error?.errorType) {
      return res.badRequest({ message: error.message });
    }
    return res.failureResponse();
  }
};

exports.userBothProfileDetailGet = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.badRequest({ message: 'Invalid UserId Only Accept ObjectId Formate' });
    }
    const getProfileData = await this.userBothProfile([mongoose.Types.ObjectId(userId)]);

    if (getProfileData.length === 0) {
      return res.noContent();
    }
    return res.ok({
      message: 'SuccessFully Get User Both Profile Detail',
      data: getProfileData,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.userProfileSetting = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validUserProfileSettingDetail,
    );
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    const { incognito, profileStatus, snooze, location } = validateRequest.value;

    if (!profileStatus.likeMinded && !profileStatus.work) {
      return res.badRequest({ message: 'Only one profile can be deactivated at a time' });
    }
    if (snooze.oneDay && snooze.oneWeek) {
      return res.badRequest({ message: 'Only one snooze setting can be set to on' });
    }
    if (
      (location.withinCountry && location.withinState) ||
      !(location.withinCountry || location.withinState)
    ) {
      return res.badRequest({
        message: 'Location settings invalid, please enable only one at a time',
      });
    }
    await UserSettingsModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          incognito,
          profileStatus,
          snooze,
          location,
        },
      },
    );
    return res.ok({ message: 'SuccessFully UserProfile Setting Update' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.userIgnoreLikeProfile = async (req, res) => {
  try {
    const { userId } = req;
    const { likeProfileId } = req.query;

    if (!isValidObjectId(likeProfileId)) {
      return res.badRequest({ message: 'Invalid likeProfileId' });
    }
    const isExitsUser = await LikeProfileModel.findOne({
      _id: mongoose.Types.ObjectId(likeProfileId),
    });
    if (!isExitsUser) {
      return res.badRequest({ message: 'User Like Profile Not Found...' });
    }

    const expiryTime = new Date().setDate(new Date().getDate() + 7);

    const createIgnoreLikeUser = new LikeSkipModel({
      profileId: mongoose.Types.ObjectId(likeProfileId),
      userId,
      expiryTime,
    });
    await createIgnoreLikeUser.save();
    return res.ok({ message: 'SuccessFully Like Profile Ignore.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.userIgnoreWorkProfile = async (req, res) => {
  try {
    const { userId } = req;
    const { workProfileId } = req.query;

    if (!isValidObjectId(workProfileId)) {
      return res.badRequest({ message: 'Invalid workProfileId' });
    }
    const isExitsUser = await WorkProfileModel.findOne({
      _id: mongoose.Types.ObjectId(workProfileId),
    });
    if (!isExitsUser) {
      return res.badRequest({ message: 'User Work Profile Not Found...' });
    }

    const expiryTime = new Date().setDate(new Date().getDate() + 7);

    const createIgnoreWorkUser = new WorkSkipModel({
      profileId: mongoose.Types.ObjectId(workProfileId),
      userId,
      expiryTime,
    });
    await createIgnoreWorkUser.save();
    return res.ok({ message: 'SuccessFully Work Profile Ignore.' });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.fcmTokenAndDeviceUpdate = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validUserFcmTokenAndDeviceDetails,
    );
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    await UsersModel.findByIdAndUpdate({ _id: req.userId }, { $set: { ...validateRequest.value } });
    return res.ok({ message: 'SuccessFully Update FCM Token And Device...!' });
  } catch (error) {
    return res.failureResponse();
  }
};

const getUserAllData = async (userId) =>
  UsersModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'need',
        localField: '_id',
        foreignField: 'userId',
        as: 'needData',
        pipeline: [
          {
            $lookup: {
              from: 'needAnswer',
              localField: '_id',
              foreignField: 'needId',
              as: 'needAnswerData',
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$needData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$needData.needAnswerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'query',
        localField: '_id',
        foreignField: 'userId',
        as: 'queryData',
        pipeline: [
          {
            $lookup: {
              from: 'queryAnswer',
              localField: '_id',
              foreignField: 'queryId',
              as: 'queryAnswerData',
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
        path: '$queryData.queryAnswerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'needAnswer',
        localField: '_id',
        foreignField: 'userId',
        as: 'needAnswerData',
      },
    },
    {
      $unwind: {
        path: '$needAnswerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'queryAnswer',
        localField: '_id',
        foreignField: 'userId',
        as: 'queryAnswerData',
      },
    },
    {
      $unwind: {
        path: '$queryAnswerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: null,
        needId: {
          $push: '$needData._id',
        },
        queryId: {
          $push: '$queryData._id',
        },
        queryAnswerId: {
          $push: '$queryData.queryAnswerData._id',
        },
        needAnswerId: {
          $push: '$needData.needAnswerData._id',
        },
        userNeedAnswerId: {
          $push: '$needAnswerData._id',
        },
        userQueryAnswerId: {
          $push: '$queryAnswerData._id',
        },
      },
    },
  ]);

exports.userAccountDelete = async (req, res) => {
  try {
    // chatRoomFind
    let getChatRoomId = await ChatRoomsModel.aggregate([
      {
        $match: {
          members: {
            $in: [mongoose.Types.ObjectId(req.userId)],
          },
          roomType: ROOM_TYPE.PRIVATE,
        },
      },
      {
        $group: {
          _id: null,
          chatRoomId: {
            $push: '$_id',
          },
        },
      },
    ]);
    getChatRoomId = getChatRoomId[0]?.chatRoomId ?? [];

    // // chatFind
    let getChatId = await chatModel.aggregate([
      {
        $match: {
          chatRoomId: {
            $in: getChatRoomId,
          },
        },
      },
      {
        $group: {
          _id: null,
          chatId: {
            $push: '$_id',
          },
        },
      },
    ]);
    getChatId = getChatId[0]?.chatId ?? [];

    const otherData = await getUserAllData(req.userId);

    let needId = [...new Set(otherData[0].needId.map((e) => e.toString()))];
    needId = needId.map((e) => mongoose.Types.ObjectId(e));

    let queryId = [...new Set(otherData[0].queryId.map((e) => e.toString()))];
    queryId = queryId.map((e) => mongoose.Types.ObjectId(e));

    let queryAnswerId = [...new Set(otherData[0].queryAnswerId.map((e) => e.toString()))];
    queryAnswerId = queryAnswerId.map((e) => mongoose.Types.ObjectId(e));

    let needAnswerId = [...new Set(otherData[0].needAnswerId.map((e) => e.toString()))];
    needAnswerId = needAnswerId.map((e) => mongoose.Types.ObjectId(e));

    let userNeedAnswerId = [...new Set(otherData[0].userNeedAnswerId.map((e) => e.toString()))];
    userNeedAnswerId = userNeedAnswerId.map((e) => mongoose.Types.ObjectId(e));

    let userQueryAnswerId = [...new Set(otherData[0].userQueryAnswerId.map((e) => e.toString()))];
    userQueryAnswerId = userQueryAnswerId.map((e) => mongoose.Types.ObjectId(e));

    const likeProfileData = await LikeProfileModel.findOne({ userId: req.userId });
    const workProfileData = await WorkProfileModel.findOne({ userId: req.userId });

    // delete Data
    await chatModel.updateMany(
      { _id: { $in: getChatId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await ChatRoomsModel.updateMany(
      { _id: { $in: getChatRoomId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );

    await LikeSkipModel.updateMany(
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              profileId: likeProfileData?._id,
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await WorkSkipModel.updateMany(
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              profileId: workProfileData?._id,
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await SavedModel.updateMany(
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              $or: [
                {
                  objectId: likeProfileData?._id,
                },
                {
                  objectId: {
                    $in: workProfileData?._id,
                  },
                },
                {
                  objectId: {
                    $in: queryId,
                  },
                },
                {
                  objectId: {
                    $in: needId,
                  },
                },
              ],
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await NeedSkipModel.updateMany(
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              needId: { $in: needId },
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await QuerySkipModel.updateMany(
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              queryId: { $in: queryId },
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await needModel.updateMany(
      { _id: { $in: needId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await queryModel.updateMany(
      { _id: { $in: queryId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await queryAnswerModel.updateMany(
      { _id: { $in: queryAnswerId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await queryAnswerModel.updateMany(
      { _id: { $in: userQueryAnswerId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await NeedAnswerModel.updateMany(
      { _id: { $in: needAnswerId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await NeedAnswerModel.updateMany(
      { _id: { $in: userNeedAnswerId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await RevealModel.updateMany(
      { chatRoomId: { $in: getChatRoomId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await UserSettingsModel.findOneAndUpdate(
      { userId: req.userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await LikeProfileModel.updateMany(
      { userId: req.userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await WorkProfileModel.updateMany(
      { userId: req.userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await LocationModel.updateMany(
      { userId: req.userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await EducationModel.updateMany(
      { userId: req.userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await connectionRequestModel.updateMany(
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(req.userId) },
            {
              receiverId: new mongoose.Types.ObjectId(req.userId),
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await NotificationsModel.updateMany(
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(req.userId),
            },
            {
              'data.user_id': new mongoose.Types.ObjectId(req.userId),
            },
          ],
        },
      },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    await UsersModel.deleteOne({ _id: new mongoose.Types.ObjectId(req.userId) });

    return res.ok({
      message: 'SuccessFully Delete User Account',
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.profileChatInitiate = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.query, validChatInitiateDetail);
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId, profileType } = validateRequest.value;

    const isValidUser = await connectionRequestModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  senderId: new mongoose.Types.ObjectId(req.userId),
                  receiverId: new mongoose.Types.ObjectId(userId),
                },
                {
                  senderId: new mongoose.Types.ObjectId(userId),
                  receiverId: new mongoose.Types.ObjectId(req.userId),
                },
              ],
            },
            {
              status: CONNECTION_STATUS.ACCEPTED,
            },
            {
              CONNECTION_TYPE: profileType,
            },
          ],
        },
      },
    ]);

    if (isValidUser.length === 0) {
      return res.badRequest({ message: 'Connection Not Found' });
    }

    const members = [req.userId, userId];

    const chatRoomData = await getChatRoom(null, members, profileType, CHAT_TYPE.CHAT, profileType);
    return res.ok({ message: 'SuccessFully Chat Initiate', data: chatRoomData });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, validVerifyUserImagePayload);
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { image1, image2 } = validateRequest.value;

    const response = await axios({
      method: 'post',
      url: 'https://faceapi.mxface.ai/api/v3/face/verify',
      headers: {
        subscriptionkey: process.env.MX_FACE_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        encoded_image1: image1,
        encoded_image2: image2,
      }),
    });

    if (response.status === 200) {
      await UsersModel.updateOne(
        { _id: mongoose.Types.ObjectId(req.userId) },
        {
          $set: {
            verified: true,
          },
        },
      );
      return res.ok({ message: 'Face Verified Successfully', data: response.data });
    }

    return res.badRequest({
      message: 'Something went wrong, both image should only have one face',
    });
  } catch (error) {
    console.log(error.response.data);
    return res.failureResponse();
  }
};

exports.displaySocialCategory = async (req, res) => {
  try {
    const getSocailCategory = await SocialLinkCategoryModel.aggregate([
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: 1,
          icon: 1,
        },
      },
    ]);
    return res.ok({ message: 'SuccessFully displayed User Link data', data: getSocailCategory });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.socialLinkSetup = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, validsocialLinkDetail);
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    const { categoryId, link, isWorkProfile, isLikeProfile } = validateRequest.value;

    const isExistCategory = await SocialLinkCategoryModel.findOne({
      _id: categoryId,
    });
    if (!isExistCategory) {
      return res.badRequest({ message: 'invalid Category ID' });
    }
    const isExitsUserInSocialData = await SocialLinksModel.findOne({
      userId,
      categoryId,
    });

    if (isExitsUserInSocialData) {
      const socialLinkAdd = await SocialLinksModel.updateOne(
        { userId, categoryId },
        {
          $set: {
            link,
            isWorkProfile,
            isLikeProfile,
          },
        },
      );
      return res.ok({ message: 'SuccessFully updated Link', data: socialLinkAdd });
    }
    const socialLinkAdd = new SocialLinksModel({
      userId,
      link,
      categoryId,
      isWorkProfile,
      isLikeProfile,
    });

    await socialLinkAdd.save();

    return res.ok({ message: 'SuccessFully Added Link', data: socialLinkAdd });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.getSocialLinks = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.badRequest({ message: 'Invalid UserId Only Accept ObjectId Formate' });
    }
    const getUserSocialLinkData = await SocialLinksModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'socialLinkCategory',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          SocialMedia: '$result.name',
          link: 1,
          userId: 1,
          _id: 0,
          icon: '$result.icon',
          isWorkProfile: 1,
          isLikeProfile: 1,
        },
      },
    ]);
    return res.ok({
      message: 'SuccessFully displayed User Link data',
      data: getUserSocialLinkData,
    });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.deleteSocialLink = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      validsocialLinkCategoryIdDetail,
    );
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;

    const { categoryId } = validateRequest.value;

    const getUserSocialLinkData = await SocialLinksModel.aggregate([
      {
        $match: {
          $and: [
            {
              userId: new mongoose.Types.ObjectId(userId),
            },
            {
              categoryId: new mongoose.Types.ObjectId(categoryId),
            },
          ],
        },
      },
    ]);
    if (getUserSocialLinkData.length > 0) {
      const deleteSocialLink = await SocialLinksModel.deleteOne({ userId, categoryId });

      return res.ok({ message: 'SuccessFully Deleted Link', data: deleteSocialLink });
    }

    return res.noContent({ message: 'no links found' });
  } catch (error) {
    return res.failureResponse();
  }
};

