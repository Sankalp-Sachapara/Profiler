/**
 * reportValidation.js
 * @description :: validate each post and put request as per report model
 */
const joi = require('joi');
const { convertObjectToEnum } = require('../common');
const { REPORT_TAG } = require('../constant');

/** validation keys and properties of user */
exports.reportValidation = joi
  .object({
    reportId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid reportId.')
      .required(),
    text: joi.string().trim().required(),
    reportTag: joi
      .string()
      .trim()
      .valid(...convertObjectToEnum(REPORT_TAG))
      .required(),
  })
  .unknown(true);

