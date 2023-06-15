/**
 * likeSkipModel.js
 * @description :: model of a database collection likeSkipModel.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    profileId: { type: Schema.Types.ObjectId },

    expiryTime: { type: Date },

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

const LikeSkipModel = mongoose.model('likeSkip', schema, 'likeSkip');
module.exports = LikeSkipModel;

