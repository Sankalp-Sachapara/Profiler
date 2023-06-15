/**
 * languageValidation.js
 * @description :: validate each post and put request as per language model
 */
const joi = require('joi');

/** validation keys and properties of language */
exports.languageAddValidation = joi
  .object({
    name: joi.string().trim().lowercase().required(),
    icon: joi
      .string()
      .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      .required(),
  })
  .unknown(true);
