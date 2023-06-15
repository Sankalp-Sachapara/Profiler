/**
 * userValidation.js
 * @description :: validate each post and put request as per user model
 */

const joi = require('joi');

/** validation keys and properties of user user */

exports.validUserSearch = joi
  .object({
    city: joi.string().trim(),
    userName: joi.string().trim(),
    longitude: joi.number(),
    latitude: joi.number(),
    page: joi.number().min(0).required(),
    limit: joi.number().min(0).required(),
  })

  .unknown(true);

