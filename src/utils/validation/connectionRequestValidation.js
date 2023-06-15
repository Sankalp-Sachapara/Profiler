/**
 * connectionRequestValidation.js
 * @description :: validate each post and put request as per connection request model
 */
const joi = require('joi');
const { CONNECTION_TYPE } = require('../constant');

/** validation keys and properties of user connection request */

exports.userCreateConnectionRequest = joi
  .object({
    userId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Id.. Enter Valid Id')
      .required(),
    connectionText: joi.string().trim().required().min(0),
    type: joi
      .string()
      .trim()
      .uppercase()
      .valid(CONNECTION_TYPE.LIKE, CONNECTION_TYPE.WORK)
      .required(),
  })
  .unknown(true);

exports.userQrConnectionValidation = joi
  .object({
    userId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Id.. Enter Valid Id')
      .required(),
    type: joi
      .string()
      .trim()
      .uppercase()
      .valid(CONNECTION_TYPE.LIKE, CONNECTION_TYPE.WORK)
      .required(),
  })
  .unknown(true);

exports.userConnectionList = joi
  .object({
    connectionType: joi
      .string()
      .trim()
      .uppercase()
      .valid(CONNECTION_TYPE.LIKE, CONNECTION_TYPE.WORK)
      .required(),
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
  })
  .unknown(true);

