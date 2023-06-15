const QuestionModel = require('../../../model/questionsModel');
const validation = require('../../../utils/validateRequest');
const { questionAddValidation } = require('../../../utils/validation/questionValidation');

exports.addQuestion = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(req.body, questionAddValidation);

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { name, profileType } = validateRequest.value;

    const isExitsQuestion = await QuestionModel.findOne({ name, profileType });
    if (isExitsQuestion) {
      return res.badRequest({ message: 'Already Exits This Question' });
    }

    const createQuestion = new QuestionModel({ name, profileType });
    await createQuestion.save();
    return res.ok({
      message: 'Successfully Create Question',
      data: createQuestion,
    });
  } catch (err) {
    return res.failureResponse();
  }
};
