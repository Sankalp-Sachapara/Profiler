const VersionModel = require('../model/versionModel');
const { DEVICE_TYPE } = require('../utils/constant');

const checkDeviceTypeAvailableOrNot = async () => {
  const versionData = await VersionModel.find({});

  if (versionData.length > 0) return;

  const addVersion = [
    {
      device_type: DEVICE_TYPE.ANDROID,
      version: 13,
    },
    {
      device_type: DEVICE_TYPE.IOS,
      version: 16.3,
    },
  ];

  await VersionModel.insertMany(addVersion);
};

module.exports = checkDeviceTypeAvailableOrNot;

