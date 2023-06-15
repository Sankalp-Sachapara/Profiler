/**
 * languageModel.js
 * @description :: model of a database collection of languageModel
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: String },

    icon: { type: String },

    isActive: { type: Boolean, default: true },

    isDeleted: { type: Boolean, default: false },

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

const LanguageModel = mongoose.model('languages', schema, 'languages');
module.exports = LanguageModel;

