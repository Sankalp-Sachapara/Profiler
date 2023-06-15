/**
 * feedsValidation.js
 * @description :: validate each post and put request as per work like need query model
 */

const joi = require('joi');
const { EXPERIENCE_TYPE } = require('../constant');

/** validation keys and properties of like/work/query/need search */
exports.validWorkSearchDetails = joi
  .object({
    radius: joi.number().min(1),
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    city: joi.string().trim().lowercase(),
    name: joi.string().trim().lowercase(),
    experience: joi.number(),
    experienceType: joi.string().trim().valid(EXPERIENCE_TYPE.GT, EXPERIENCE_TYPE.LT),
    openToWork: joi.boolean(),
    skill: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill Only Valid ObjectId'),
      )
      .required(),
    industry: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid industry id'),
      )
      .required(),
    language: joi.array().items(joi.string().trim()).required(),
  })
  .unknown(true);

exports.validLikeSearchDetails = joi
  .object({
    radius: joi.number().min(1),
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    city: joi.string().trim().lowercase(),
    name: joi.string().trim().lowercase(),
    interest: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid interest Only Valid ObjectId'),
      )
      .required(),
    language: joi.array().items(joi.string().trim()).required(),
  })
  .unknown(true);

exports.validNeedOrQuerySearchDetails = joi
  .object({
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    skillOrInterest: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid skillOrInterest Only Valid ObjectId'),
      )
      .required(),
  })
  .unknown(true);

exports.validProfileSearchDetails = joi
  .object({
    radius: joi.number().min(1),
    page: joi.number().min(1).required(),
    limit: joi.number().min(1).required(),
    city: joi.string().trim().lowercase(),
    name: joi.string().trim().lowercase(),
    keyword: joi.string().trim().lowercase(),
    experience: joi.number(),
    experienceType: joi.string().trim().valid(EXPERIENCE_TYPE.GT, EXPERIENCE_TYPE.LT),
    openToWork: joi.boolean(),
    skill: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill Only Valid ObjectId'),
      )
      .required(),
    interest: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Interest Only Valid ObjectId'),
      )
      .required(),
    industry: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid industry id'),
      )
      .required(),
    language: joi.array().items(joi.string().trim()).required(),
  })
  .unknown(true);

