const LanguageModel = require('../../../model/languageModel');

exports.getLanguageList = async (req, res) => {
  try {
    const getLanguageListData = await LanguageModel.find({
      isDeleted: false,
    });
    if (getLanguageListData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully LanguageList Get', data: getLanguageListData });
  } catch (error) {
    return res.failureResponse();
  }
};
