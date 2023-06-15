/**
 * Language.routes.js
 * @description :: routes of user Language setup all APIs
 */
const express = require('express');
const { getLanguageList } = require('../../../controller/mobile/v1/languageController');

const routes = express.Router();
/**
 * @swagger
 * /mobile/v1/language:
 *  get:
 *   summary: This Api Is Get Language
 *   description: This Api Is Get Language
 *   tags:
 *    - User Language
 *   responses:
 *    200:
 *     description: SuccessFully Get Language..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', getLanguageList);

module.exports = routes;
