/**
 * queryAnswerModel.js
 * @description :: model of a database collection query answer.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    queryId: { type: Schema.Types.ObjectId },

    answer: { type: String },

    createdAt: { type: Date },

    updatedAt: { type: Date },

    read: { type: Boolean, default: false },

    rate: { type: Number, default: 0 },

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

const queryAnswerModel = mongoose.model('queryAnswer', schema, 'queryAnswer');
module.exports = queryAnswerModel;

