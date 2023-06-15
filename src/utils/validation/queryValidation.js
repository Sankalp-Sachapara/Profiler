/**
 * queryValidation.js
 * @description :: validate each post and put request as per user model
 */
const joi = require('joi');

/** validation keys and properties of user */
exports.queryAnswerValidation = joi.object({
  queryId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Id Enter Valid Id')
    .required(),
  queryAnswer: joi.string().trim().required(),
});

exports.commonQueryValidation = joi.object({
  question: joi.string().trim().required(),
  skill: joi
    .array()
    .items(
      joi
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid SkillId Only Valid ObjectId'),
    )
    .required(),
  interest: joi
    .array()
    .items(
      joi
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid InterestId Only Valid ObjectId'),
    )
    .required(),
  anonymous: joi.boolean().required(),
});

exports.validQueryAnsweredRateDetails = joi
  .object({
    rate: joi.number().min(1).max(5).required(),
  })
  .unknown(true);

exports.validQuerySearch = joi
  .object({
    city: joi.string().trim(),
    userName: joi.string().trim(),
    longitude: joi.number(),
    latitude: joi.number(),
    page: joi.number().min(0).required(),
    limit: joi.number().min(0).required(),
  })

  .unknown(true);

