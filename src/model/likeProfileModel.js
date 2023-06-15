/**
 * LikeProfileModel.js
 * @description :: model of a database collection Like Profile Model
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },

    aboutMe: { type: String },

    images: [{ type: String }],

    interest: [{ type: Schema.Types.ObjectId }],

    questions: [
      {
        questionId: { type: Schema.Types.ObjectId },
        name: { type: String },
        answerType: { type: String },
        answer: { type: String },
      },
    ],

    openToWork: { type: Boolean, default: true },

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

const LikeProfileModel = mongoose.model('likeProfile', schema, 'likeProfile');
module.exports = LikeProfileModel;

