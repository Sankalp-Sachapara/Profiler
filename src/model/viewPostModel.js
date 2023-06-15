/**
 * viewedPostsModel.js
 * @description :: model of a database collection of ViewedPostsModel
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    postId: { type: Schema.Types.ObjectId },

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

const ViewedPostsModel = mongoose.model('viewedPosts', schema, 'viewedPosts');
module.exports = ViewedPostsModel;
