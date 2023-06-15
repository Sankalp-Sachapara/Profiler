const InterestCategoryModel = require('../../../model/interestCategoryModel');

exports.getInterestList = async (req, res) => {
  try {
    const getInterestListData = await InterestCategoryModel.aggregate([
      {
        $lookup: {
          from: 'interests',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'interests',
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
          interests: 1,
        },
      },
    ]);
    if (getInterestListData.length === 0) {
      return res.noContent();
    }
    return res.ok({ message: 'SuccessFully InterestList Get', data: getInterestListData });
  } catch (error) {
    return res.failureResponse();
  }
};
