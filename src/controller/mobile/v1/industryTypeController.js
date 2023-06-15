const IndustryTypeModel = require('../../../model/industryTypeModel');

exports.getIndustryTypeList = async (req, res) => {
  try {
    const getIndustryTypeList = await IndustryTypeModel.find({ isDeleted: false });
    if (getIndustryTypeList.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully IndustryTypeList Get', data: getIndustryTypeList });
  } catch (error) {
    return res.failureResponse();
  }
};
