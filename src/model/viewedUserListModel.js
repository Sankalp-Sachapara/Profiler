/**
 * viewedUserListsModel.js
 * @description :: model of a database collection of ViewedUserListsModel
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { convertObjectToEnum } = require('../utils/common');
const { PROFILE_TYPE } = require('../utils/constant');

const schema = new Schema(
  {
    viewerId: { type: Schema.Types.ObjectId },

    suggestedUserId: { type: Schema.Types.ObjectId },

    profileType: { type: String, enum: convertObjectToEnum(PROFILE_TYPE) },

    viewingTime: { type: Date },

    expiryTime: { type: Date },

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

const ViewedUserListsModel = mongoose.model('viewedUserLists', schema, 'viewedUserLists');
module.exports = ViewedUserListsModel;

