/**
 * bugTypeValidation.js
 * @description :: validate each post and put request as per bugTy[e] model
 */
const joi = require('joi');

/** validation keys and properties of language */
exports.bugTypeAddValidation = joi
  .object({
    type: joi.string().trim().lowercase().required(),
  })
  .unknown(true);
