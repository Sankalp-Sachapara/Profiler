/**
 * notificationsModel.js
 * @description :: model of a database collection of NotificationsModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { NOTIFICATION_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    notificationType: { type: String, enum: convertObjectToEnum(NOTIFICATION_TYPE) },

    text: { type: String },

    data: { type: Object },

    read: { type: Boolean, default: false },

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

const NotificationsModel = mongoose.model('notifications', schema, 'notifications');
module.exports = NotificationsModel;

