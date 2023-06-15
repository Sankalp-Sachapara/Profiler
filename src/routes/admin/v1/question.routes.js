/**
 * question.routes.js
 * @description :: routes of user question setup all APIs
 */
const express = require('express');
const { addQuestion } = require('../../../controller/admin/v1/questionController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/question:
//  *  post:
//  *   summary: This Api Is Create Question
//  *   description: This Api Is Create Question
//  *   tags:
//  *    - Admin Question
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        name:
//  *         type: string
//  *         example: playing
//  *        profileType:
//  *         type: string
//  *         example: LIKE/WORK
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create Question..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addQuestion);

module.exports = routes;
