/**
 * questionValidation.js
 * @description :: validate each post and put request as per question model
 */
const joi = require('joi');
const { PROFILE_TYPE } = require('../constant');

/** validation keys and properties of question */
exports.questionAddValidation = joi
  .object({
    name: joi.string().trim().required(),
    profileType: joi.string().trim().valid(PROFILE_TYPE.LIKE, PROFILE_TYPE.WORK).required(),
  })
  .unknown(true);
