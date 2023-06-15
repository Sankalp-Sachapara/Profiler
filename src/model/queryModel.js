/**
 * queryModel.js
 * @description :: model of a database collection query.
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { ACTIVE_STATUS } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    status: {
      type: String,
      enum: convertObjectToEnum(ACTIVE_STATUS),
      default: ACTIVE_STATUS.ACTIVE,
    },

    question: { type: String },

    skill: [{ type: Schema.Types.ObjectId }],

    interest: [{ type: Schema.Types.ObjectId }],

    anonymous: { type: Boolean, default: false },

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

const queryModel = mongoose.model('query', schema, 'query');
module.exports = queryModel;

