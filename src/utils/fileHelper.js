/* eslint-disable no-useless-escape */
const mime = require('mime');
const AWS = require('aws-sdk');
const axios = require('axios');
const tinify = require('tinify');
const { v4: uuidv4 } = require('uuid');
const { IMAGE_TYPE, FILE_TYPE, AUDIO_TYPE, APPLICATION_TYPE } = require('./constant');
const { convertObjectToEnum } = require('./common');

tinify.key = process.env.TINIFY_API_KEY;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});

const FilePathProfile = (uploadType, fileName) => `profiler/${uploadType}/${fileName}`;
const FilePathSkillIcon = (fileName) => `profiler/SKILL_ICON/${fileName}`;
const FilePathInterestIcon = (fileName) => `profiler/INTEREST_ICON/${fileName}`;
const FilePathLanguageIcon = (fileName) => `profiler/LANGUAGE_ICON/${fileName}`;
const FilePathIndustryTypeIcon = (fileName) => `profiler/INDUSTRY_TYPE_ICON/${fileName}`;
const FilePathQuestionAnswer = (fileName) => `profiler/QUESTION_ANSWER/${fileName}`;
const FilePathSocialLinkCategory = (fileName) => `profiler/SOCIAL_LINK_CATEGORY/${fileName}`;
const FilePathBugType = (fileName) => `profiler/BUG_TYPE/${fileName}`;

const ChatRoomPDFUpload = (userId, fileName) => `profiler/CHAT/${userId}/PDF/${fileName}`;

const ChatRoomAudioUpload = (userId, fileName) => `profiler/CHAT/${userId}/AUDIO/${fileName}`;

const ChatRoomImageUpload = (userId, fileName) => `profiler/CHAT/${userId}/IMAGE/${fileName}`;

const tinifyImage = (fileBase64) => {
  const buff = Buffer.from(fileBase64, 'base64');
  return new Promise((resolve, reject) => {
    tinify.fromBuffer(buff).toBuffer((err, result) => {
      if (err) {
        return reject({ success: false, message: 'File compression failed', error: err });
      }
      return resolve(result);
    });
  });
};

const uploadS3 = (buff, uploadFilePath) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: uploadFilePath,
    Body: buff,
    ACL: 'public-read',
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, async (s3Err, data) => {
      if (s3Err) {
        console.log('🚀 ~ file: fileHelper.js ~ line 60 ~ s3Err', s3Err);
        reject({ success: false, message: 'Upload to S3 failed', error: s3Err });
      } else {
        resolve({
          success: true,
          path: data.Location,
          message: 'Upload to S3 successful',
        });
      }
    });
  });
};

const decodeBase64 = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};

  if (!matches || matches.length !== 3) {
    return { success: false, message: 'Invalid Base64 string' };
  }

  const { 1: type } = matches;
  response.type = type;
  response.data = Buffer.from(matches[2], 'base64');
  const ext = mime.getExtension(matches[1]);
  const fullExt = matches[1];
  response.ext = fullExt;
  response.fileName = `${uuidv4()}.${ext}`;

  return { ...response, success: true };
};

const isValidImageformat = (type, fileExt) =>
  type === FILE_TYPE.IMAGE && convertObjectToEnum(IMAGE_TYPE).includes(fileExt);

const isValidAudioFormat = (type, fileExt) =>
  type === FILE_TYPE.AUDIO && convertObjectToEnum(AUDIO_TYPE).includes(fileExt);

const isValidPdfFormat = (type, fileExt) =>
  type === FILE_TYPE.APPLICATION && convertObjectToEnum(APPLICATION_TYPE).includes(fileExt);

/**
 *
 * @param {String} base64
 * @param {String} uploadType
 * @returns {Promise}
 *
 * Takes base64 and uploadType then uploads it to server under profile/ directory
 */
exports.handleChatFileUploads = async (base64, userId) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }
  const fileExt = decodedImg.ext.split('/');

  if (isValidImageformat(fileExt[0], fileExt[1])) {
    let buffData = decodedImg.data;
    try {
      buffData = await tinifyImage(buffData);
    } catch (err) {
      return err;
    }
    return uploadS3(buffData, ChatRoomImageUpload(userId, decodedImg.fileName));
  }

  if (isValidPdfFormat(fileExt[0], fileExt[1])) {
    const buffData = decodedImg.data;
    return uploadS3(buffData, ChatRoomPDFUpload(userId, decodedImg.fileName));
  }

  if (isValidAudioFormat(fileExt[0], fileExt[1])) {
    const buffData = decodedImg.data;
    return uploadS3(buffData, ChatRoomAudioUpload(userId, decodedImg.fileName));
  }

  return {
    success: false,
    message: 'Invalid base64 file type format',
  };
};

/**
 *
 * @param {String} base64
 * @param {String} uploadType
 * @returns {Promise}
 *
 * Takes base64 and uploadType then uploads it to server under profile/ directory
 */
exports.uploadProfile = async (base64, uploadType) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }

  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathProfile(uploadType, decodedImg.fileName));
};

/**
 *
 * @param {String} base64
 * @returns {Promise}
 *
 * Takes base64  then uploads it to server under profile/SKILL_ICON directory
 */
exports.uploadSkillIcon = async (base64) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }
  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathSkillIcon(decodedImg.fileName));
};

/**
 *
 * @param {String} base64
 * @returns {Promise}
 *
 * Takes base64  then uploads it to server under profile/INTEREST_ICON directory
 */
exports.uploadInterestIcon = async (base64) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }
  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathInterestIcon(decodedImg.fileName));
};

/**
 *
 * @param {String} base64
 * @returns {Promise}
 *
 * Takes base64  then uploads it to server under profile/LANGUAGE_ICON directory
 */
exports.uploadLanguageIcon = async (base64) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }
  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathLanguageIcon(decodedImg.fileName));
};

/**
 *
 * @param {String} base64
 * @returns {Promise}
 *
 * Takes base64  then uploads it to server under profile/INDUSTRY_TYPE_ICON directory
 */
exports.uploadIndustryTypeIcon = async (base64) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }
  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathIndustryTypeIcon(decodedImg.fileName));
};

exports.getImageBase64WithExt = async (picture) => {
  const arrayBuffer = await axios.get(picture, {
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(arrayBuffer.data, 'binary').toString('base64');
  const image = `data:${arrayBuffer.headers['content-type']};base64,${buffer}`;

  return image;
};

/**
 *
 * @param {String} base64
 * @returns {Promise}
 *
 * Takes base64 then uploads it to server under profile/QUESTION_ANSWER directory
 */
exports.uploadQuestionAnswer = async (base64) => {
  const decodedAudio = decodeBase64(base64);
  if (!decodedAudio.success) {
    return decodedAudio;
  }

  const fileExt = decodedAudio.ext.split('/');
  if (!isValidAudioFormat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid Audio format',
    };
  }
  return uploadS3(decodedAudio.data, FilePathQuestionAnswer(decodedAudio.fileName));
};

/**
 *
 * @param {String} base64
 * @returns {Promise}
 *
 * Takes base64  then uploads it to server under profile/SOCIAL_CATEGORY_ICON directory
 */
exports.uploadSocialLinkCategoryIcon = async (base64) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }
  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathSocialLinkCategory(decodedImg.fileName));
};

exports.uploadBugTypeImages = async (base64) => {
  const decodedImg = decodeBase64(base64);
  if (!decodedImg.success) {
    return decodedImg;
  }

  const fileExt = decodedImg.ext.split('/');
  if (!isValidImageformat(fileExt[0], fileExt[1])) {
    return {
      success: false,
      message: 'Invalid image format',
    };
  }
  let buffData = decodedImg.data;
  if (fileExt[0] === FILE_TYPE.IMAGE) {
    try {
      buffData = await tinifyImage(decodedImg.data);
    } catch (error) {
      return error;
    }
  }
  return uploadS3(buffData, FilePathBugType(decodedImg.fileName));
};
