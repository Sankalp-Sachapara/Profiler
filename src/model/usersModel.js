/**
 * usersModel.js
 * @description :: model of a database collection of usersModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { GENDER, PROVIDER, DEVICE_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: String },

    dateOfBirth: { type: Date },

    gender: { type: String, enum: convertObjectToEnum(GENDER) },

    provider: { type: String, enum: convertObjectToEnum(PROVIDER) },

    providerId: { type: String },

    verified: { type: Boolean, default: false },

    link: { type: String },

    fcmToken: { type: String },

    email: {
      type: String,
    },

    device: { type: String, enum: convertObjectToEnum(DEVICE_TYPE) },

    language: [{ type: Schema.Types.ObjectId }],

    mobileNumber: { type: String },

    mobileCode: { type: String },

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date },

    deletedAt: { type: Date },

    updatedAt: { type: Date },

    isDeleted: { type: Boolean, default: false },

    isOnline: { type: Boolean, default: false },
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

const UsersModel = mongoose.model('users', schema, 'users');
module.exports = UsersModel;

