/**
 * blockValidation.js
 * @description :: validate each post and put request as per user block model
 */
const joi = require('joi');

/** validation keys and properties of user */
exports.userBlockValidation = joi
  .object({
    userId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Block User Id')
      .required(),
  })
  .unknown(true);

