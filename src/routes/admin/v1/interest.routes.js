/**
 * interest.routes.js
 * @description :: routes of user interest setup all APIs
 */
const express = require('express');
const { addInterest } = require('../../../controller/admin/v1/interestController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/interest:
//  *  post:
//  *   summary: This Api Is Create interest
//  *   description: This Api Is Create interest
//  *   tags:
//  *    - Admin Interest
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
//  *     description: SuccessFully Create Interest..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addInterest);

module.exports = routes;
