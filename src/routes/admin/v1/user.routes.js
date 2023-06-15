/**
 * user.routes.js
 * @description :: routes of user Profile Get API
 */
const express = require('express');
const { userListGet } = require('../../../controller/admin/v1/userController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/user:
//  *  get:
//  *   summary: This Api Is User List Get
//  *   description: This Api Is User List Get
//  *   tags:
//  *    - Admin User
//  *   parameters:
//  *      - in: query
//  *        name: longitude
//  *        schema:
//  *          type: number
//  *          require: true
//  *          description: longitude
//  *        example: 72.831062
//  *      - in: query
//  *        name: latitude
//  *        schema:
//  *          type: number
//  *          require: true
//  *          description: latitude
//  *        example: 21.170240
//  *      - in: query
//  *        name: city
//  *        schema:
//  *          type: string
//  *          description: city of user
//  *        example: surat
//  *      - in: query
//  *        name: userName
//  *        schema:
//  *          type: string
//  *          require: true
//  *          description: userName
//  *      - in: query
//  *        name: limit
//  *        schema:
//  *          type: number
//  *          description: number of data limit
//  *        example: 10
//  *      - in: query
//  *        name: page
//  *        schema:
//  *          type: number
//  *          require: true
//  *          description: page
//  *        example: 1
//  *   responses:
//  *    200:
//  *     description: SuccessFully User List Get..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.get('/', userListGet);

module.exports = routes;

