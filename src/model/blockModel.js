/**
 * blockModel.js
 * @description :: model of a database collection of blockModel.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    blockUserId: { type: Schema.Types.ObjectId },

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

const BlockModel = mongoose.model('block', schema, 'block');
module.exports = BlockModel;

