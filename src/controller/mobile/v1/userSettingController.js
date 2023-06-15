/**
 * userSettingController.js
 * @description :: exports user setting method
 */

const UserSettingsModel = require('../../../model/userSettingModel');

exports.userSettingGet = async (req, res) => {
  try {
    const { userId } = req;

    const getUserSettingData = await UserSettingsModel.findOne({
      userId,
    });

    return res.ok({ message: 'SuccessFully UserSetting Get', data: getUserSettingData });
  } catch (err) {
    return res.failureResponse();
  }
};

