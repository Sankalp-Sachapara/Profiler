/**
 * chatModel.js
 * @description :: model of a database collection of chatModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { CHAT_DATA_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    chatRoomId: { type: Schema.Types.ObjectId },

    sender: { type: Schema.Types.ObjectId },

    read: [{ type: Schema.Types.ObjectId }],

    content: { type: String },

    type: { type: String, enum: convertObjectToEnum(CHAT_DATA_TYPE) },

    isDeleted: { type: Boolean, default: false },

    createdAt: { type: Date },

    deletedAt: { type: Date },

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

const chatModel = mongoose.model('chats', schema, 'chats');
module.exports = chatModel;

