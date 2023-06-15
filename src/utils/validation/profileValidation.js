/**
 * profileValidation.js
 * @description :: validate each post and put request as per profile model
 */
const joi = require('joi');
const { GENDER, PROFILE_QUESTION_ANSWER_TYPE, DEVICE_TYPE, PROFILE_TYPE } = require('../constant');

/** validation keys and properties of user Profile */
exports.validBasicProfileDetails = joi
  .object({
    name: joi.string().trim().required(),
    dateOfBirth: joi.date().required(),
    gender: joi
      .string()
      .trim()
      .uppercase()
      .valid(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER)
      .required(),
    location: joi.object({
      longitude: joi.number().min(0).max(90).required(),
      latitude: joi.number().min(-180).max(180).required(),
      city: joi.string().trim().lowercase().required(),
      state: joi.string().trim().lowercase().required(),
      country: joi.string().trim().lowercase().required(),
      altitude: joi.number().required(),
      airPressure: joi.number().required(),
    }),
  })
  .unknown(true);

exports.validLikeMindedProfileDetail = joi.object({
  aboutMe: joi.string().trim().required(),
  interest: joi
    .array()
    .items(
      joi
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid InterestId Only Valid ObjectId'),
    )
    .max(10)
    .required(),
  images: joi
    .array()
    .items(
      joi.alternatives().conditional(joi.string().pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/), {
        then: joi
          .string()
          .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
          .required(),
        otherwise: joi.string().uri().required(),
      }),
    )
    .required(),

  questions: joi.alternatives().try(
    joi.array().items({
      questionId: joi
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid questionId Only Valid ObjectId')
        .required(),
      name: joi.string().trim().required(),
      answerType: joi
        .string()
        .trim()
        .valid(PROFILE_QUESTION_ANSWER_TYPE.TEXT, PROFILE_QUESTION_ANSWER_TYPE.AUDIO)
        .required(),
      answer: joi.alternatives().conditional('answerType', {
        is: PROFILE_QUESTION_ANSWER_TYPE.AUDIO,
        then: joi.alternatives().conditional(
          joi
            .string()
            .trim()
            .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          {
            then: joi
              .string()
              .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
              .required(),
            otherwise: joi.string().uri().required(),
          },
        ),
        otherwise: joi.string().trim().required(),
      }),
    }),
    joi.string().trim().valid('null'),
  ),

  education: joi.string().trim(),
  yearOfPassOut: joi.number(),
  institution: joi.string().trim(),
  link: joi.alternatives(joi.string().uri(), joi.string().trim().valid('null')),
  openToWork: joi.boolean(),
  language: joi.array().items(
    joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid languageId Only Valid ObjectId')
      .required(),
  ),
});

exports.validProfessionalProfileDetail = joi.object({
  aboutMe: joi.string().trim().required(),
  skills: joi
    .array()
    .items(
      joi
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid SkillId Only Valid ObjectId'),
    )
    .max(5)
    .required(),
  images: joi
    .array()
    .items(
      joi.alternatives().conditional(joi.string().pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/), {
        then: joi
          .string()
          .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
          .required(),
        otherwise: joi.string().uri().required(),
      }),
    )
    .required(),
  questions: joi.alternatives(
    joi.array().items({
      questionId: joi
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid questionId Only Valid ObjectId')
        .required(),
      name: joi.string().trim().required(),
      answerType: joi
        .string()
        .trim()
        .valid(PROFILE_QUESTION_ANSWER_TYPE.TEXT, PROFILE_QUESTION_ANSWER_TYPE.AUDIO)
        .required(),
      answer: joi.alternatives().conditional('answerType', {
        is: PROFILE_QUESTION_ANSWER_TYPE.AUDIO,
        then: joi.alternatives().conditional(
          joi
            .string()
            .trim()
            .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          {
            then: joi
              .string()
              .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
              .required(),
            otherwise: joi.string().uri().required(),
          },
        ),
        otherwise: joi.string().trim().required(),
      }),
    }),
    joi.string().trim().valid('null'),
  ),

  education: joi.string().trim(),
  yearOfPassOut: joi.number(),
  institution: joi.string().trim(),
  jobRole: joi.string().trim(),
  companyName: joi.string().trim(),
  industryType: joi.string().trim(),
  experience: joi.number(),
  link: joi.alternatives(joi.string().uri(), joi.string().trim().valid('null')),
  openToWork: joi.boolean(),
  language: joi.array().items(
    joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid languageId Only Valid ObjectId')
      .required(),
  ),
});

exports.validUserProfileSettingDetail = joi.object({
  incognito: joi.boolean().required(),
  anonymousAnswering: joi.boolean().required(),
  profileStatus: joi
    .object({
      likeMinded: joi.boolean().required(),
      work: joi.boolean().required(),
    })
    .required(),
  snooze: joi
    .object({
      oneDay: joi.boolean().required(),
      oneWeek: joi.boolean().required(),
    })
    .required(),
  location: joi
    .object({
      withinCountry: joi.boolean().required(),
      withinState: joi.boolean().required(),
    })
    .required(),
});

exports.validUserFcmTokenAndDeviceDetails = joi.object({
  fcmToken: joi.string().trim().required(),
  device: joi.string().trim().uppercase().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).required(),
});

exports.validProfileSearch = joi.object({
  city: joi.string().trim().lowercase(),
  userName: joi.string().trim(),
  longitude: joi.number(),
  latitude: joi.number(),
  page: joi.number().min(0).required(),
  limit: joi.number().min(0).required(),
});

exports.validChatInitiateDetail = joi.object({
  profileType: joi
    .string()
    .trim()
    .uppercase()
    .valid(PROFILE_TYPE.LIKE, PROFILE_TYPE.WORK)
    .required(),
  userId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid UserId Only Valid ObjectId')
    .required(),
});

exports.validVerifyUserImagePayload = joi.object({
  image1: joi.string().required(),
  image2: joi.string().required(),
});

exports.validsocialLinkDetail = joi.object({
  categoryId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid categoryId Only Valid ObjectId')
    .required(),
  link: joi
    .string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  isWorkProfile: joi.boolean().required(),
  isLikeProfile: joi.boolean().required(),
});
exports.validsocialLinkCategoryIdDetail = joi.object({
  categoryId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid categoryId Only Valid ObjectId')
    .required(),
});
