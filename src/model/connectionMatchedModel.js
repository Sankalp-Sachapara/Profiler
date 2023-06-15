/**
 * connectionMatched.js
 * @description :: model of a database collection connection matched Model
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { CONNECTION_TYPE } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userA: {
      type: Schema.Types.ObjectId,
    },

    userB: {
      type: Schema.Types.ObjectId,
    },

    type: { type: String, enum: convertObjectToEnum(CONNECTION_TYPE) },

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

const connectionMatchedModel = mongoose.model('connectionMatched', schema, 'connectionMatched');
module.exports = connectionMatchedModel;

