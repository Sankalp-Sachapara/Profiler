/**
 * verificationModel.js
 * @description :: model of a database collection verification.
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { CONNECTION_STATUS } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    photo: { type: String },

    status: {
      type: String,
      enum: convertObjectToEnum(CONNECTION_STATUS),
      default: CONNECTION_STATUS.PENDING,
    },

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

const verificationModel = mongoose.model('verification', schema, 'verification');
module.exports = verificationModel;

