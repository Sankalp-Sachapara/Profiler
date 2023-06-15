/**
 * suggestion.routes.js
 * @description :: routes of user suggestion setup all APIs
 */
const express = require('express');
const { suggestionListGet } = require('../../../controller/mobile/v1/suggestionController');

const routes = express.Router();
/**
 * @swagger
 * /mobile/v1/suggestion:
 *  get:
 *   summary: This Api Is Get Suggestion
 *   description: This Api Is Get Suggestion
 *   tags:
 *    - User Suggestion
 *   parameters:
 *      - in: query
 *        name: profileType
 *        schema:
 *          type: string
 *          require: true
 *          description: ProfileType
 *        example: LIKE/WORK
 *   responses:
 *    200:
 *     description: SuccessFully Get Suggestion..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', suggestionListGet);

module.exports = routes;

