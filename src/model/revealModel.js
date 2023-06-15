/**
 * revealModel.js
 * @description :: model of a database collection of revealModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { REVEAL_STATUS } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    chatRoomId: { type: Schema.Types.ObjectId },

    senderId: { type: Schema.Types.ObjectId },

    receiverId: { type: Schema.Types.ObjectId },

    status: {
      type: String,
      enum: convertObjectToEnum(REVEAL_STATUS),
      default: REVEAL_STATUS.PENDING,
    },

    isDeleted: { type: Boolean, default: false },

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

const RevealModel = mongoose.model('reveal', schema, 'reveal');
module.exports = RevealModel;

