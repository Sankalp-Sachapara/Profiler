/**
 * EducationModel.js
 * @description :: model of a database collection user education detail
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },

    education: { type: String },

    yearOfPassOut: { type: Number },

    institution: { type: String },

    isDeleted: { type: Boolean, default: false },

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

const EducationModel = mongoose.model('education', schema, 'education');
module.exports = EducationModel;

