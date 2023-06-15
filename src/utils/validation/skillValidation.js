/**
 * skillValidation.js
 * @description :: validate each post and put request as per skill model
 */
const joi = require('joi');

/** validation keys and properties of skill */
exports.skillAddValidation = joi
  .object({
    name: joi.string().trim().lowercase().required(),
    categoryId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill CategoryId Only Valid ObjectId')
      .required(),
    icon: joi
      .string()
      .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      .required(),
  })
  .unknown(true);
