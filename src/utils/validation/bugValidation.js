/**
 * bugValidation.js
 * @description :: validate each post and put request as per bug model
 */
const joi = require('joi');

exports.validBugAddDetail = joi.object({
  bugTypeId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid categoryId Only Valid ObjectId')
    .required(),
  issue: joi.string().trim(),
  images: joi
    .array()
    .items(
      joi.alternatives().conditional(joi.string().pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/), {
        then: joi
          .string()
          .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
          .required(),
        otherwise: joi.string().uri().required(),
      }),
    )
    .required(),
  deviceInfo: joi.string().trim().lowercase().allow(''),
});
