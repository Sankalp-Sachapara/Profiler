const LanguageModel = require('../../../model/languageModel');
const { uploadLanguageIcon } = require('../../../utils/fileHelper');
const validation = require('../../../utils/validateRequest');
const { languageAddValidation } = require('../../../utils/validation/languageValidation');

exports.addLanguage = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, languageAddValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, icon } = validateRequest.value;

    const isExitsLanguageName = await LanguageModel.findOne({ name });
    if (isExitsLanguageName) {
      return res.badRequest({ message: 'Already Exits This Language Name' });
    }

    const iconImgPath = await uploadLanguageIcon(icon);
    const createLanguage = new LanguageModel({ name, icon: iconImgPath.path });
    await createLanguage.save();
    return res.ok({
      message: 'Successfully Create Language',
      data: createLanguage,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
