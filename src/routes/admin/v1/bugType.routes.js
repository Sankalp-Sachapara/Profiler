/**
 * bugType.routes.js
 * @description :: routes of admin bug Type setup all APIs
 */
const express = require('express');
const { addBugType } = require('../../../controller/admin/v1/bugTypeController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/bugType:
//  *  post:
//  *   summary: This Api Is Create Bug Type
//  *   description: This Api Is Create Bug Type
//  *   tags:
//  *    - Admin
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        type:
//  *         type: string
//  *         example: user
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create Bug Type..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addBugType);

module.exports = routes;
