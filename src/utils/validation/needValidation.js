/**
 * needValidation.js
 * @description :: validate each post and put request as per need model
 */

const joi = require('joi');

/** validation keys and properties of user Need */
exports.validNeedAnsweredDetails = joi
  .object({
    answer: joi.string().trim().required(),
    needId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid NeedId Only Valid ObjectId')
      .required(),
  })
  .unknown(true);

exports.validNeedCreateOrUpdateDetails = joi
  .object({
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
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid interestId Only Valid ObjectId'),
      )
      .required(),
  })
  .unknown(true);

exports.validNeedAnsweredRateDetails = joi
  .object({
    rate: joi.number().min(1).max(5).required(),
  })
  .unknown(true);

exports.validNeedSearch = joi
  .object({
    city: joi.string().trim(),
    userName: joi.string().trim(),
    longitude: joi.number(),
    latitude: joi.number(),
    page: joi.number().min(0).required(),
    limit: joi.number().min(0).required(),
  })

  .unknown(true);

