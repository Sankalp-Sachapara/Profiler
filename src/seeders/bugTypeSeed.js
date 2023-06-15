const BugTypeModel = require('../model/bugTypeModel');

const checkBugTypeAvailableOrNot = async () => {
  const bugType = await BugTypeModel.find({});

  if (bugType.length > 0) return;

  const addBugType = [
    {
      type: 'Functional',
    },
    {
      type: 'Security',
    },
  ];

  await BugTypeModel.insertMany(addBugType);
};

module.exports = checkBugTypeAvailableOrNot;
