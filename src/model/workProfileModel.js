/**
 * WorkProfileModel.js
 * @description :: model of a database collection Work Profile Model
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },

    industryType: {
      type: Schema.Types.ObjectId,
    },

    selfEmployed: { type: Boolean, default: false },

    jobRole: { type: String },

    companyName: { type: String },

    experience: { type: Number },

    aboutMe: { type: String },

    images: [{ type: String }],

    skills: [{ type: Schema.Types.ObjectId }],

    questions: [
      {
        questionId: { type: Schema.Types.ObjectId },
        name: { type: String },
        answerType: { type: String },
        answer: { type: String },
      },
    ],

    openToWork: { type: Boolean, default: true },

    createdAt: { type: Date },

    updatedAt: { type: Date },

    isDeleted: { type: Boolean, default: false },

    deletedAt: { type: Date },
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

const WorkProfileModel = mongoose.model('workProfile', schema, 'workProfile');
module.exports = WorkProfileModel;

