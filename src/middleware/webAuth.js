/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const UsersModel = require('../model/usersModel');
const ExpiredTokenModel = require('../model/expiredTokenModel');

const secretKey = process.env.SECRET_KEY;

const checkTokenValidity = async (token) =>
  new Promise((res, rej) => {
    (async () => {
      try {
        const decoded = jwt.verify(token, secretKey);
        const tokenData = await ExpiredTokenModel.findOne({
          token,
          userId: mongoose.Types.ObjectId(decoded.userId),
        });
        if (!tokenData) {
          res({
            userId: mongoose.Types.ObjectId(decoded.userId),
          });
        } else {
          rej('Your Token Is Expire.....');
        }
      } catch (err) {
        rej('Your Token Is Expire.....');
      }
    })();
  });

module.exports = async (req, res, next) => {
  const token = req.header('x-access-token');
  if (!token) {
    return res.unAuthorizedRequest({ message: 'Token Not Found....' });
  }

  checkTokenValidity(token)
    .then(async (result) => {
      const userData = await UsersModel.findOne({
        _id: mongoose.Types.ObjectId(result.userId),
      });

      if (userData) {
        req.token = token;
        req.userId = result.userId;
        req.user = userData;
        next();
      } else {
        return res.unAuthorizedRequest({
          message: 'Only User Access This API..!',
        });
      }
    })
    .catch((err) => {
      console.log('🚀 ~ file: webAuth.js ~ line 57 ~ module.exports= ~ err', err);
      res.unAuthorizedRequest({ message: err });
    });

  return {};
};
