const IndustryTypeModel = require('../../../model/industryTypeModel');
const { uploadIndustryTypeIcon } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const { industryTypeAddValidation } = require('../../../utils/validation/industryTypeValidation');

exports.addIndustryType = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, industryTypeAddValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, icon } = validateRequest.value;

    const isExitsIndustryTypeName = await IndustryTypeModel.findOne({ name });
    if (isExitsIndustryTypeName) {
      return res.badRequest({ message: 'Already Exits This IndustryType Name' });
    }

    const iconImgPath = await uploadIndustryTypeIcon(icon);
    const createIndustryType = new IndustryTypeModel({ name, icon: iconImgPath.path });
    await createIndustryType.save();
    return res.ok({
      message: 'Successfully Create IndustryType',
      data: createIndustryType,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
