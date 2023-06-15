/**
 * locationModel.js
 * @description :: model of a database collection of locationModel
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    city: { type: String },

    state: { type: String },

    country: { type: String },

    altitude: { type: Number },

    airPressure: { type: Number },

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

schema.index({ location: '2dsphere' });

const LocationModel = mongoose.model('locations', schema, 'locations');
module.exports = LocationModel;

