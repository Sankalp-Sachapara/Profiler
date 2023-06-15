/**
 * suggestionModel.js
 * @description :: model of a database collection of suggestionModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { PROFILE_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    text: { type: String },

    profileType: { type: String, enum: convertObjectToEnum(PROFILE_TYPE) },

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date },

    updatedAt: { type: Date },

    isDeleted: { type: Boolean, default: false },
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

const SuggestionModel = mongoose.model('suggestion', schema, 'suggestion');
module.exports = SuggestionModel;

