const InterestCategoryModel = require('../../../model/interestCategoryModel');
const InterestModel = require('../../../model/skillModel');
const { uploadInterestIcon } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const { interestAddValidation } = require('../../../utils/validation/interestValidation');

exports.addInterest = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, interestAddValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, icon, categoryId } = validateRequest.value;

    const isExitsInterestName = await InterestModel.findOne({ name });
    if (isExitsInterestName) {
      return res.badRequest({ message: 'Already Exits This Interest Name' });
    }

    const isValidCategoryId = await InterestCategoryModel.findById({ _id: categoryId });
    if (!isValidCategoryId) {
      return res.badRequest({ message: 'Invalid Interest CategoryId' });
    }

    const iconImgPath = await uploadInterestIcon(icon);
    const createInterest = new InterestModel({ name, icon: iconImgPath.path, categoryId });
    await createInterest.save();
    return res.ok({
      message: 'Successfully Create Interest',
      data: createInterest,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
