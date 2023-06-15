/**
 * bugModel.js
 * @description :: model of a database collection of bugModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { BUG_STATUS } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId },

    issue: { type: String },

    bugTypeId: { type: mongoose.Types.ObjectId },

    images: [{ type: String }],

    deviceInfo: { type: String },

    status: { type: String, enum: convertObjectToEnum(BUG_STATUS), default: BUG_STATUS.PENDING },

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

const BugsModel = mongoose.model('bugs', schema, 'bugs');
module.exports = BugsModel;
