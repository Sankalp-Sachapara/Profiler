/**
 * question.routes.js
 * @description :: routes of user question setup all APIs
 */
const express = require('express');
const { getQuestionList } = require('../../../controller/mobile/v1/questionController');

const routes = express.Router();
/**
 * @swagger
 * /mobile/v1/question:
 *  get:
 *   summary: This Api Is Get Question
 *   description: This Api Is Get Question
 *   tags:
 *    - User Question
 *   responses:
 *    200:
 *     description: SuccessFully Get Question..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', getQuestionList);

module.exports = routes;
