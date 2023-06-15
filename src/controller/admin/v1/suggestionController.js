const SuggestionModel = require('../../../model/suggestionModel');
const validation = require('../../../utils/validateRequest');
const { suggestionAddValidation } = require('../../../utils/validation/suggestionValidation');

exports.createSuggestion = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, suggestionAddValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { text, profileType } = validateRequest.value;
    const isExitsSuggestion = await SuggestionModel.findOne({ text, profileType });
    if (isExitsSuggestion) {
      return res.badRequest({ message: 'This Suggestion is already exits for this profileType' });
    }
    const createSuggestionData = new SuggestionModel({
      text,
      profileType,
    });
    await createSuggestionData.save();
    return res.ok({ message: 'SuccessFully Create Suggestion' });
  } catch (error) {
    return res.failureResponse();
  }
};

