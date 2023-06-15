const SuggestionModel = require('../../../model/suggestionModel');
const validation = require('../../../utils/validateRequest');
const { suggestionListGetValidation } = require('../../../utils/validation/suggestionValidation');

exports.suggestionListGet = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.query,
      suggestionListGetValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { profileType } = validateRequest.value;
    const isExitsSuggestion = await SuggestionModel.find({ profileType });

    if (isExitsSuggestion.length === 0) {
      return res.noContent();
    }

    return res.ok({ message: 'SuccessFully Get Suggestion List', data: isExitsSuggestion });
  } catch (error) {
    return res.failureResponse();
  }
};

