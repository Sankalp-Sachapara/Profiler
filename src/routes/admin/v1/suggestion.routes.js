/**
 * suggestion.routes.js
 * @description :: routes of user suggestion setup all APIs
 */
const express = require('express');
const { createSuggestion } = require('../../../controller/admin/v1/suggestionController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/suggestion:
//  *  post:
//  *   summary: This Api Is Create Suggestion
//  *   description: This Api Is Create Suggestion
//  *   tags:
//  *    - Admin Suggestion
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        text:
//  *         type: string
//  *         example: playing
//  *        profileType:
//  *         type: string
//  *         example: LIKE/WORK
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create Suggestion..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', createSuggestion);

module.exports = routes;

