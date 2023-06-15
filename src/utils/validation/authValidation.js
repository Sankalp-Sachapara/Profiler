/**
 * userValidation.js
 * @description :: validate each post and put request as per user model
 */
const joi = require('joi');
const { DEVICE_TYPE } = require('../constant');

/** validation keys and properties of user */
exports.whatsUpLoginValidation = joi
  .object({
    platform: joi
      .string()
      .trim()
      .uppercase()
      .valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS)
      .required(),
    token: joi.string().required(),
  })
  .unknown(true);

/** validation keys and properties of user */
exports.facebookLoginValidation = joi
  .object({
    token: joi.string().required(),
  })
  .unknown(true);

/** validation keys and properties of user */
exports.googleLoginValidation = joi
  .object({
    token: joi
      .string()
      .required()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/, '..Invalid Token !!'),
    providerId: joi.string().required(),
  })
  .unknown(true);

exports.sendOtpValidation = joi
  .object({
    mobileNumber: joi
      .string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    mobileCode: joi.string().length(3).required(),
  })
  .unknown(true);

exports.verifyOtpValidation = joi.object({
  mobileNumber: joi
    .string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required(),
  mobileCode: joi.string().length(3).required(),
  otp: joi.string().length(6).required(),
});

exports.authTokenCheckValidation = joi
  .object({
    token: joi
      .string()
      .trim()
      .required()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/, '..Invalid Token'),
  })
  .unknown(true);

exports.bothTokenValidation = joi
  .object({
    token: joi
      .string()
      .required()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/, 'Invalid Token..!!'),
    refreshToken: joi
      .string()
      .required()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/, 'Invalid RefreshToken..!'),
  })

  .unknown(true);

exports.LogoutValidation = joi
  .object({
    refreshToken: joi
      .string()
      .required()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/, 'Invalid RefreshToken..!'),
  })
  .unknown(true);

exports.whatsAppGetUrlValidation = joi
  .object({
    platform: joi
      .string()
      .trim()
      .uppercase()
      .valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS)
      .required(),
    redirectionURL: joi.string().trim().required(),
  })

  .unknown(true);

exports.getAppDialog = joi.object({
  deviceType: joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).required(),
});

