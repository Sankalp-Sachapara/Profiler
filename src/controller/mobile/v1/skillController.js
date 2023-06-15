const SkillCategoryModel = require('../../../model/skillCategoryModel.');

exports.getSkillList = async (req, res) => {
  try {
    const getSkillListData = await SkillCategoryModel.aggregate([
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'skills',
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                icon: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          skills: 1,
        },
      },
    ]);
    if (getSkillListData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully SkillList Get', data: getSkillListData });
  } catch (error) {
    return res.failureResponse();
  }
};
