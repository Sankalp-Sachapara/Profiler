/**
 * questionsModel.js
 * @description :: model of a database collection of questionsModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { PROFILE_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: String },

    profileType: { type: String, enum: convertObjectToEnum(PROFILE_TYPE) },

    isActive: { type: Boolean, default: true },

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

const QuestionsModel = mongoose.model('questions', schema, 'questions');
module.exports = QuestionsModel;

