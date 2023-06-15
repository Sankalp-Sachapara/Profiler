/**
 * chatValidation.js
 * @description :: validate each post and put request as per chat Model
 */
const joi = require('joi');
const { convertObjectToEnum } = require('../common');
const { CHAT_DATA_TYPE, REVEAL_STATUS } = require('../constant');

/** validation keys and properties of user */
exports.chatBase64Validation = joi
  .object({
    base64: joi
      .string()
      .pattern(/^data:([A-Za-z-+\/]+);base64,(.+)$/, 'Invalid Base64....')
      .required(),
  })
  .unknown(true);

exports.getChatRoomValidation = joi.object({
  lastChatRoomsId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid lastChatRoomId'),
  pageSize: joi.number().min(1).required(),
});

exports.sendMessageValidation = joi.object({
  chatRoomId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ChatRoomId')
    .required(),
  messageType: joi
    .string()
    .trim()
    .uppercase()
    .valid(...convertObjectToEnum(CHAT_DATA_TYPE))
    .required(),
  message: joi.string().trim().required(),
});

exports.joinChatValidation = joi.object({
  chatRoomId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ChatRoomId')
    .required(),
});

exports.onlineStatusValidation = joi.object({
  userId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid userId')
    .required(),
});

exports.getMessageValidation = joi.object({
  chatRoomId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ChatRoomId')
    .required(),
  lastMessageId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid lastChatRoomId'),
  pageSize: joi.number().min(1).required(),
});

exports.readMessageValidation = joi.object({
  chatRoomId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ChatRoomId')
    .required(),
  messageId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Message Id')
    .required(),
});

exports.revealRequestValidation = joi.object({
  chatRoomId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ChatRoomId')
    .required(),
  receiverId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Sender Id')
    .required(),
});

exports.answerRevealRequestValidation = joi.object({
  revealId: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid RevealId')
    .required(),
  status: joi
    .string()
    .trim()
    .uppercase()
    .valid(REVEAL_STATUS.ACCEPTED, REVEAL_STATUS.REJECTED)
    .required(),
});

