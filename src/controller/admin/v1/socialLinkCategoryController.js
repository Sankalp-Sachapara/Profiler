const SocialLinkCategoryModel = require('../../../model/socialLinkCategoryModel');
const { uploadSocialLinkCategoryIcon } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const {
  socialLinkCategoryAddValidation,
} = require('../../../utils/validation/socialLinkCategoryValidation');

exports.addSocialLinkCategory = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      socialLinkCategoryAddValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, icon, link } = validateRequest.value;

    const isExitsCategoryName = await SocialLinkCategoryModel.findOne({ name });
    if (isExitsCategoryName) {
      return res.badRequest({ message: 'Already Exits This Category Name' });
    }

    const iconImgPath = await uploadSocialLinkCategoryIcon(icon);
    const createLinkCategory = new SocialLinkCategoryModel({ name, icon: iconImgPath.path, link });
    await createLinkCategory.save();
    return res.ok({
      message: 'Successfully Create socialLink Category',
      data: createLinkCategory,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
