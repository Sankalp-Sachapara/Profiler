const SkillCategoryModel = require('../../../model/skillCategoryModel.');
const SkillsModel = require('../../../model/skillModel');
const { uploadSkillIcon } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const skillAddValidation = require('../../../utils/validation/skillValidation');

exports.addSkill = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      skillAddValidation.skillAddValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, icon, categoryId } = validateRequest.value;

    const isExitsSkillName = await SkillsModel.findOne({ name });
    if (isExitsSkillName) {
      return res.badRequest({ message: 'Already Exits This Skill Name' });
    }

    const isValidCategoryId = await SkillCategoryModel.findById({ _id: categoryId });
    if (!isValidCategoryId) {
      return res.badRequest({ message: 'Invalid Skill CategoryId' });
    }

    const iconImgPath = await uploadSkillIcon(icon);
    const createSkill = new SkillsModel({ name, icon: iconImgPath.path, categoryId });
    await createSkill.save();
    return res.ok({
      message: 'Successfully Create Skill',
      data: createSkill,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
