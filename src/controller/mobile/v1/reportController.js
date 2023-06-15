/**
 * reportController.js
 * @description :: exports report methods
 */

const { default: mongoose } = require('mongoose');
const validation = require('../../../utils/validateRequest');
const UserModel = require('../../../model/usersModel');
const ReportModel = require('../../../model/reportModel');
const { reportValidation } = require('../../../utils/validation/reportValidation');
const { REPORT_TAG } = require('../../../utils/constant');
const LikeProfileModel = require('../../../model/likeProfileModel');
const WorkProfileModel = require('../../../model/workProfileModel');
const NeedModel = require('../../../model/needModel');
const NeedAnswerModel = require('../../../model/needAnswerModel');
const QueryModel = require('../../../model/queryModel');
const QueryAnswerModel = require('../../../model/queryAnswermodel');

exports.createReport = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, reportValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { reportId, reportTag, text } = validateRequest.value;
    const { userId } = req;
    let checkReportId;

    if (reportTag === REPORT_TAG.USER) {
      checkReportId = await UserModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }
    if (reportTag === REPORT_TAG.LIKE) {
      checkReportId = await LikeProfileModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }
    if (reportTag === REPORT_TAG.WORK) {
      checkReportId = await WorkProfileModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }
    if (reportTag === REPORT_TAG.NEED) {
      checkReportId = await NeedModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }
    if (reportTag === REPORT_TAG.QUERY) {
      checkReportId = await QueryModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }
    if (reportTag === REPORT_TAG.QUERY_ANSWERED) {
      checkReportId = await QueryAnswerModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }
    if (reportTag === REPORT_TAG.NEED_APPLIED) {
      checkReportId = await NeedAnswerModel.findOne({
        _id: mongoose.Types.ObjectId(reportId),
      });
    }

    if (!checkReportId) {
      return res.badRequest({
        message: 'Invalid Id',
      });
    }

    const createReport = new ReportModel({
      userId,
      reportId,
      reportTag,
      text,
    });
    await createReport.save();

    return res.ok({ message: 'SuccessFully Report Send' });
  } catch (err) {
    return res.failureResponse();
  }
};

