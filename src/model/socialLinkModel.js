/**
 * socialLinkModel.js
 * @description :: model of a database collection of socialLinkModel
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId },

    link: { type: String },

    categoryId: { type: mongoose.Types.ObjectId },

    isWorkProfile: { type: Boolean, default: true },

    isLikeProfile: { type: Boolean, default: true },

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

const SocialLinksModel = mongoose.model('socialLinks', schema, 'socialLinks');
module.exports = SocialLinksModel;
