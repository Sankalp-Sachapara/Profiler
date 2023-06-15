/**
 * skill.routes.js
 * @description :: routes of user skill setup all APIs
 */
const express = require('express');
const { getSkillList } = require('../../../controller/mobile/v1/skillController');

const routes = express.Router();
/**
 * @swagger
 * /mobile/v1/skill:
 *  get:
 *   summary: This Api Is Get skill
 *   description: This Api Is Get skill
 *   tags:
 *    - User Skill
 *   responses:
 *    200:
 *     description: SuccessFully Get Skill..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', getSkillList);

module.exports = routes;
