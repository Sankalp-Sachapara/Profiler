/**
 * versionModel.js
 * @description :: model of a database collection of device Type version
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    device_type: {
      type: String,
    },

    version: {
      type: Number,
    },

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

const VersionModel = mongoose.model('version', schema, 'version');
module.exports = VersionModel;

