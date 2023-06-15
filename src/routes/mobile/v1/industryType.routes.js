/**
 * Language.routes.js
 * @description :: routes of user Language setup all APIs
 */
const express = require('express');
const { getIndustryTypeList } = require('../../../controller/mobile/v1/industryTypeController');

const routes = express.Router();
/**
 * @swagger
 * /mobile/v1/industryType:
 *  get:
 *   summary: This Api Is Get IndustryType
 *   description: This Api Is Get IndustryType
 *   tags:
 *    - User IndustryType
 *   responses:
 *    200:
 *     description: SuccessFully Get IndustryType..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', getIndustryTypeList);

module.exports = routes;
