/**
 * userSetting.routes.js
 * @description :: routes of user Settings APIs
 */

const express = require('express');

const routes = express.Router();
const userSettingController = require('../../../controller/mobile/v1/userSettingController');

/**
 * @swagger
 * /mobile/v1/userSetting:
 *  get:
 *   summary: This Api Is Get userSetting.
 *   description: This Api Is Get userSetting.
 *   tags:
 *    - User Setting
 *   responses:
 *    200:
 *     description: SuccessFully Get userSetting.
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', userSettingController.userSettingGet);

module.exports = routes;

