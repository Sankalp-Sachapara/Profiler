const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

const secretKey = process.env.SECRET_KEY;
const jwtExpiry = process.env.JWTEXPIRY || 1440;
const jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRY || 1440;
const InterestsModel = require('../model/interestModel');
const SkillsModel = require('../model/skillModel');
const UserSettingsModel = require('../model/userSettingModel');
const BlockModel = require('../model/blockModel');
const OtpModel = require('../model/otpModel');

/**
 * @description : service to generate JWT token for authentication.
 * @param {String} userId : id of the user.
 * @return {string}  : returns JWT token.
 */
exports.generateToken = async (userId) => {
  const token = jwt.sign(
    {
      userId,
    },
    secretKey,
    { expiresIn: jwtExpiry * 60 },
  );

  const refreshToken = jwt.sign(
    {
      userId,
      token,
    },
    secretKey,
    { expiresIn: jwtRefreshExpiry * 60 },
  );
  return { token, refreshToken };
};

/**
 * @description : service to verify JWT token for authentication.
 * @param {String} token : token of the user.
 * @return {string}  : returns decoded token.
 */
exports.tokenVerify = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (!decoded) {
        reject({ message: 'Token Invalid....', data: { isValid: false } });
      } else if (err) {
        reject({ message: err.message, data: { isValid: false } });
      }
      resolve({ message: 'Token Valid...', decoded, isValid: true });
    });
  });

/**
 *
 * @param {String} id String that needs to be checked for the id
 * @returns
 */
exports.isValidObjectId = (id) => {
  if (!id || id.length === 0) {
    return false;
  }

  if (id.toString().match(/^[0-9a-fA-F]{24}$/)) {
    return true;
  }
  return false;
};

/**
 *
 * @param {Number} page this is the current pageNo
 * @param {Number} limit this is the limit of items per page
 * @returns {Array} 0: limit, 1: pageNo, 2: skipsize
 */
exports.getLimitAndSkipSize = (page, limit) => {
  let pageNo = parseInt(page, 10);

  if (!pageNo) {
    pageNo = 1;
  }

  let newLimit = parseInt(limit, 10);
  if (!newLimit) {
    newLimit = 10;
  }

  const skipSize = (pageNo - 1) * newLimit;
  return [pageNo, newLimit, skipSize];
};

/**
 *
 * @param {String} userId User Id of the OTP Created.
 * @param {String} expiry Time of the OTP Expire.
 * @returns
 */
exports.generateOtp = (userId, expiry) => {
  const { ENV } = process.env;
  let otp = Math.floor(Math.random() * 100000) + 100000;
  if (ENV === 'DEV') {
    otp = '999999';
  }

  new OtpModel({ otp, userId, expiry }).save();

  return otp;
};

/**
 *
 * @param {Any} object This is the object that needs to be converted into the enum
 * @returns
 *
 * Works only for string and number
 */
exports.convertObjectToEnum = (object) => Object.entries(object).map((e) => e[1]);

/**
 *
 * @param {Array} skill list of skill id
 * @param {Array} interest list of interest id
 * @param {Array} userId this is the limit of items per page
 * @param {Array} question this is the limit of items per page
 * @returns
 */
exports.checkSkillIdOrInterestId = async (skill, interest, userId, question, anonymous) =>
  new Promise((resolve, reject) => {
    (async () => {
      let obj = {};

      if (skill.length === 0 && interest.length === 0) {
        return reject({
          message: 'skill & interest both value is null please fill any one',
          errorType: 'SkillInterest',
        });
      }

      if (skill.length !== 0 && interest.length !== 0) {
        return reject({
          message: 'skill & interest both value set not possible please fill any one',
          errorType: 'SkillInterest',
        });
      }

      if (interest.length !== 0) {
        const interestData = await interest.map(async (ele) => {
          const checkInterestId = await InterestsModel.findById({
            _id: ele,
          });

          if (!checkInterestId) {
            return reject({
              message: `Invalid This InterestId ${ele}..`,
              errorType: 'SkillInterest',
            });
          }
        });
        await Promise.all(interestData);

        obj = {
          userId,
          question,
          interest,
          anonymous,
        };
        return resolve(obj);
      }
      const skillData = await skill.map(async (ele) => {
        const isExitsSkill = await SkillsModel.findById({
          _id: ele,
        });

        if (!isExitsSkill) {
          return reject({ message: `Invalid This SkillId ${ele}..` });
        }
      });
      await Promise.all(skillData);

      obj = {
        userId,
        question,
        skill,
        anonymous,
      };
      return resolve(obj);
    })();
  });

exports.getUserSetting = async (userId) => UserSettingsModel.findOne({ userId });

exports.getBlockUser = async (userId) =>
  BlockModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        blockUsers: {
          $push: '$blockUserId',
        },
      },
    },
    {
      $unset: '_id',
    },
  ]);
