/**
 * need.routes.js
 * @description :: routes of need Profile Get API
 */
const express = require('express');
const { needListGet } = require('../../../controller/admin/v1/needController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/need:
//  *  get:
//  *   summary: This Api Is Need List Get
//  *   description: This Api Is Need List Get
//  *   tags:
//  *    - Admin Need
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
//  *     description: SuccessFully Need List Get..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.get('/', needListGet);

module.exports = routes;

