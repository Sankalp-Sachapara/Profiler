/**
 * savedValidation.js
 * @description :: validate each post and put request as per saved model
 */

const joi = require('joi');
const { SAVED_TYPE } = require('../constant');

/** validation keys and properties of user Saved */
exports.validSavedDetails = joi
  .object({
    type: joi
      .string()
      .trim()
      .uppercase()
      .valid(SAVED_TYPE.LIKE, SAVED_TYPE.QUERY, SAVED_TYPE.WORK, SAVED_TYPE.NEED)
      .required(),
    objectId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
      .required(),
    status: joi.boolean().required(),
  })
  .unknown(true);

exports.validSavedSearch = joi
  .object({
    city: joi.string().trim(),
    userName: joi.string().trim(),
    page: joi.number().min(0).required(),
    limit: joi.number().min(0).required(),
  })

  .unknown(true);

