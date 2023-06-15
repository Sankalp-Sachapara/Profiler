const BugTypeModel = require('../../../model/bugTypeModel');
const validation = require('../../../utils/validateRequest');
const { bugTypeAddValidation } = require('../../../utils/validation/bugTypeValidation');

exports.addBugType = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, bugTypeAddValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { type } = validateRequest.value;

    const isExitsBugType = await BugTypeModel.findOne({ type });
    if (isExitsBugType) {
      return res.badRequest({ message: 'Already Exits This bug type ' });
    }
    const createBugType = new BugTypeModel({ type });
    await createBugType.save();
    return res.ok({
      message: 'Successfully Create new Bug type',
      data: createBugType,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
