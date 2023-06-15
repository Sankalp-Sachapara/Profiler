/**
 * userSettingModel.js
 * @description :: model of a database collection of userSettingModel
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    location: {
      withinCountry: { type: Boolean },
      withinState: { type: Boolean },
    },

    profileStatus: {
      likeMinded: { type: Boolean },
      work: { type: Boolean },
    },
    snooze: {
      oneDay: { type: Boolean },
      oneWeek: { type: Boolean },
      expiryTime: { type: Date },
    },

    incognitoMode: { type: Boolean, default: false },

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

const UserSettingsModel = mongoose.model('userSettings', schema, 'userSettings');
module.exports = UserSettingsModel;

