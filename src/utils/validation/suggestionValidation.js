/**
 * SuggestionValidation.js
 * @description :: validate each post and put request as per Suggestion model
 */
const joi = require('joi');
const { PROFILE_TYPE } = require('../constant');

/** validation keys and properties of Suggestion */
exports.suggestionAddValidation = joi
  .object({
    text: joi.string().trim().required(),
    profileType: joi
      .string()
      .trim()
      .uppercase()
      .valid(PROFILE_TYPE.LIKE, PROFILE_TYPE.WORK)
      .required(),
  })
  .unknown(true);

exports.suggestionListGetValidation = joi
  .object({
    profileType: joi
      .string()
      .trim()
      .uppercase()
      .valid(PROFILE_TYPE.LIKE, PROFILE_TYPE.WORK)
      .required(),
  })
  .unknown(true);

