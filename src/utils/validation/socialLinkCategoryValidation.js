/**
 * socialLinkCategoryValidation.js
 * @description :: validate each post and put request as per SocialLinkCategory model
 */
const joi = require('joi');

/** validation keys and properties of language */
exports.socialLinkCategoryAddValidation = joi
  .object({
    name: joi.string().trim().lowercase().required(),
    icon: joi
      .string()
      .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      .required(),
    link: joi
      .string()
      .uri({ scheme: ['http', 'https'] })
      .required(),
  })
  .unknown(true);
