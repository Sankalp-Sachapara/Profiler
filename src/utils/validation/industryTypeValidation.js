/**
 * IndustryTypeValidation.js
 * @description :: validate each post and put request as per IndustryType model
 */
const joi = require('joi');

/** validation keys and properties of IndustryType */
exports.industryTypeAddValidation = joi
  .object({
    name: joi.string().trim().lowercase().required(),
    icon: joi
      .string()
      .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      .required(),
  })
  .unknown(true);
