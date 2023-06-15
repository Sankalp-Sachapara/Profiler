/**
 * interest.routes.js
 * @description :: routes of user interest setup all APIs
 */
const express = require('express');
const { addIndustryType } = require('../../../controller/admin/v1/industryTypeController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/industryType:
//  *  post:
//  *   summary: This Api Is Create IndustryType
//  *   description: This Api Is Create IndustryType
//  *   tags:
//  *    - Admin IndustryType
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        name:
//  *         type: string
//  *         example: filming
//  *        icon:
//  *         type: string
//  *         example: base64
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create IndustryType..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addIndustryType);

module.exports = routes;
