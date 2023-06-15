/**
 * skill.routes.js
 * @description :: routes of user skill setup all APIs
 */
const express = require('express');
const { addSkill } = require('../../../controller/admin/v1/skillController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/skill:
//  *  post:
//  *   summary: This Api Is Create skill
//  *   description: This Api Is Create skill
//  *   tags:
//  *    - Admin Skill
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        name:
//  *         type: string
//  *         example: playing
//  *        categoryId:
//  *         type: string
//  *         example: categoryId
//  *        icon:
//  *         type: string
//  *         example: base64
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create Skill..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addSkill);

module.exports = routes;
