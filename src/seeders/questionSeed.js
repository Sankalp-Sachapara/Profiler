const QuestionsModel = require('../model/questionsModel');
const { PROFILE_TYPE } = require('../utils/constant');

const checkQuestionAvailableOrNot = async () => {
  const questionData = await QuestionsModel.find({});

  if (questionData.length > 0) return;

  const question = [
    {
      name: 'My Goal ?',
      profileType: PROFILE_TYPE.LIKE,
    },
    {
      name: 'i am proud of ?',
      profileType: PROFILE_TYPE.LIKE,
    },
    {
      name: 'My Goal ?',
      profileType: PROFILE_TYPE.WORK,
    },
    {
      name: 'i am proud of ?',
      profileType: PROFILE_TYPE.WORK,
    },
  ];

  await QuestionsModel.insertMany(question);
};

module.exports = checkQuestionAvailableOrNot;
