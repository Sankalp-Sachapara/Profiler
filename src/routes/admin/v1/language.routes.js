/**
 * skill.routes.js
 * @description :: routes of user skill setup all APIs
 */
const express = require('express');
const { addLanguage } = require('../../../controller/admin/v1/languageController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/language:
//  *  post:
//  *   summary: This Api Is Create language
//  *   description: This Api Is Create language
//  *   tags:
//  *    - Admin Language
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        name:
//  *         type: string
//  *         example: urdu
//  *        icon:
//  *         type: string
//  *         example: base64
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create Language..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addLanguage);

module.exports = routes;
