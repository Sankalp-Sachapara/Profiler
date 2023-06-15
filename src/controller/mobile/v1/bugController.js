/**
 * bugController.js
 * @description :: exports Bug all method
 */

const { default: mongoose } = require('mongoose');
const BugsModel = require('../../../model/bugModel');
const BugTypeModel = require('../../../model/bugTypeModel');
const { uploadBugTypeImages } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const { validBugAddDetail } = require('../../../utils/validation/bugValidation');

const imageCheckAndUpload = async (images) =>
  new Promise((resolve, reject) => {
    (async () => {
      let newImage = await images.map(async (ele) => {
        const uploadImageInBucket = await uploadBugTypeImages(ele);
        if (!uploadImageInBucket.success) {
          return reject({ message: uploadImageInBucket.message, errorType: 'FileUpload' });
        }
        return uploadImageInBucket.path;
      });
      newImage = await Promise.all(newImage);
      resolve(newImage);
    })();
  });

exports.displayBugType = async (req, res) => {
  try {
    const getBugType = await BugTypeModel.aggregate([
      {
        $project: {
          _id: 0,
          bugTypeId: '$_id',
          bugCategory: '$type',
        },
      },
    ]);
    return res.ok({ message: 'SuccessFully displayed Bug Types data', data: getBugType });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.bugReport = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, validBugAddDetail);
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { userId } = req;
    const { bugTypeId, issue, deviceInfo } = validateRequest.value;
    let { images } = validateRequest.value;

    images = await imageCheckAndUpload(images);

    const bugReport = new BugsModel({
      userId,
      bugTypeId,
      issue,
      images,
      deviceInfo,
    });

    await bugReport.save();

    return res.ok({ message: 'SuccessFully Reported Bug', data: bugReport });
  } catch (error) {
    if (error?.errorType) {
      return res.badRequest({ message: error.message });
    }
    return res.failureResponse();
  }
};

exports.getBugReports = async (req, res) => {
  try {
    const { userId } = req;
    const getUserBugReportData = await BugsModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'bugType',
          localField: 'bugTypeId',
          foreignField: '_id',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          bugType: '$result.type',
          issue: 1,
          status: 1,
          images: 1,
          deviceInfo: 1,
        },
      },
    ]);

    if (getUserBugReportData.length === 0) {
      return res.noContent();
    }

    return res.ok({
      message: 'SuccessFully displayed user Reported Bugs',
      data: getUserBugReportData,
    });
  } catch (error) {
    return res.failureResponse();
  }
};
