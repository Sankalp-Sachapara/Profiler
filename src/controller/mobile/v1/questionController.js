const QuestionModel = require('../../../model/questionsModel');

exports.getQuestionList = async (req, res) => {
  try {
    const getQuestionListData = await QuestionModel.find({});
    if (getQuestionListData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully QuestionList Get', data: getQuestionListData });
  } catch (error) {
    return res.failureResponse();
  }
};
