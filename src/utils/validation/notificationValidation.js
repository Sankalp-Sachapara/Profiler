/**
 * notificationValidation.js
 * @description :: validate each post and put request as per notification model
 */
const joi = require('joi');

/** validation keys and properties of user connection request */

exports.userGetNotification = joi
  .object({
    lastNotificationId: joi
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Id.. Enter Valid Id'),
    pageSize: joi.number().min(0),
  })

  .unknown(true);

