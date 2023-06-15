const SuggestionModel = require('../model/suggestionModel');
const { PROFILE_TYPE } = require('../utils/constant');

const checkSuggestionAvailableOrNot = async () => {
  const suggestionData = await SuggestionModel.find({});

  if (suggestionData.length > 0) return;

  const suggestion = [
    {
      text: 'HEY! I AM',
      profileType: PROFILE_TYPE.LIKE,
    },
    {
      text: 'LOOKING FOR',
      profileType: PROFILE_TYPE.LIKE,
    },
    {
      text: 'I CAN HELP YOU.',
      profileType: PROFILE_TYPE.LIKE,
    },
    {
      text: 'HEY! I AM',
      profileType: PROFILE_TYPE.WORK,
    },
    {
      text: 'LOOKING FOR',
      profileType: PROFILE_TYPE.WORK,
    },
    {
      text: 'I CAN HELP YOU.',
      profileType: PROFILE_TYPE.WORK,
    },
  ];

  await SuggestionModel.insertMany(suggestion);
};

module.exports = checkSuggestionAvailableOrNot;

