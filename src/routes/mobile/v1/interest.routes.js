/**
 * skill.routes.js
 * @description :: routes of user skill setup all APIs
 */
const express = require('express');
const { getInterestList } = require('../../../controller/mobile/v1/interestController');

const routes = express.Router();
/**
 * @swagger
 * /mobile/v1/interest:
 *  get:
 *   summary: This Api Is Get skill
 *   description: This Api Is Get skill
 *   tags:
 *    - User Interest
 *   responses:
 *    200:
 *     description: SuccessFully Get Skill..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', getInterestList);

module.exports = routes;
