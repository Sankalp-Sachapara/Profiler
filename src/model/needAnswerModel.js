/**
 *NeedAnswerModel.js
 * @description :: model of a database collection need answer.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    needId: { type: Schema.Types.ObjectId },

    answer: { type: String },

    read: { type: Boolean, default: false },

    rate: { type: Number, default: 0 },

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

const NeedAnswerModel = mongoose.model('needAnswer', schema, 'needAnswer');
module.exports = NeedAnswerModel;

