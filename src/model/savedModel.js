/**
 * savedModel.js
 * @description :: model of a database collection of savedModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { SAVED_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    objectId: { type: Schema.Types.ObjectId },

    type: { type: String, enum: convertObjectToEnum(SAVED_TYPE) },

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

const SavedModel = mongoose.model('saved', schema, 'saved');
module.exports = SavedModel;

