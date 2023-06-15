/**
 * querySkipModel.js
 * @description :: model of a database collection querySkip.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    queryId: { type: Schema.Types.ObjectId },

    expiryDate: { type: Date },

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

const QuerySkipModel = mongoose.model('querySkip', schema, 'querySkip');
module.exports = QuerySkipModel;

