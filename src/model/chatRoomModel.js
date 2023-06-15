/**
 * chatRoomsModel.js
 * @description :: model of a database collection of ChatRoomsModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { CHAT_TYPE, CHAT_TAGS, ROOM_TYPE, PROFILE_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId }],

    roomType: { type: String, enum: convertObjectToEnum(ROOM_TYPE) },

    chatType: { type: String, enum: convertObjectToEnum(CHAT_TYPE) },

    tag: { type: String, enum: convertObjectToEnum(CHAT_TAGS) },

    postId: { type: Schema.Types.ObjectId },

    profileRefererType: { type: String, enum: convertObjectToEnum(PROFILE_TYPE) },

    isDeleted: { type: Boolean, default: false },

    isBlocked: { type: Boolean, default: false },

    deletedAt: { type: Date },

    createdAt: { type: Date },

    updatedAt: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

schema.method('toJSON', function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  return object;
});

const ChatRoomsModel = mongoose.model('chatRooms', schema, 'chatRooms');
module.exports = ChatRoomsModel;

