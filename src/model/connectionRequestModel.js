/**
 * connectionRequest.js
 * @description :: model of a database collection connection request Model
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { CONNECTION_TYPE, CONNECTION_STATUS } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
    },

    connectionText: { type: String, default: '' },

    CONNECTION_TYPE: { type: String, enum: convertObjectToEnum(CONNECTION_TYPE) },

    status: {
      type: String,
      enum: convertObjectToEnum(CONNECTION_STATUS),
      default: CONNECTION_STATUS.PENDING,
    },

    isDeleted: { type: Boolean, default: false },

    deletedAt: { type: Date },

    connectionExpiryTime: { type: Date },

    chatExpiryTime: { type: Date },

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

const connectionRequestModel = mongoose.model('connectionRequest', schema, 'connectionRequest');
module.exports = connectionRequestModel;

