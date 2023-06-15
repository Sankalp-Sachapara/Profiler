/**
 * reportModel.js
 * @description :: model of a database collection of reportModel
 */

const mongoose = require('mongoose');
const { convertObjectToEnum } = require('../utils/common');
const { REPORT_TAG } = require('../utils/constant');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    reportId: { type: Schema.Types.ObjectId },

    reportTag: { type: String, enum: convertObjectToEnum(REPORT_TAG) },

    text: { type: String },

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

const ReportModel = mongoose.model('report', schema, 'report');
module.exports = ReportModel;

