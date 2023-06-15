/**
 * userTokens.js
 * @description :: model of a database collection userTokens
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { paginatorCustomLabels } = require('../db/config');

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };
const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },

    token: { type: String },

    refreshToken: { type: String },
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
  object.token = undefined;
  return object;
});
schema.plugin(mongoosePaginate);

const ExpiredTokenModel = mongoose.model('expiredToken', schema, 'expiredToken');
module.exports = ExpiredTokenModel;

