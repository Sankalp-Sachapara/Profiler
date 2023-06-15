/**
 * query.routes.js
 * @description :: routes of query Profile Get API
 */
const express = require('express');
const { queryListGet } = require('../../../controller/admin/v1/queryController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/query:
//  *  get:
//  *   summary: This Api Is Query List Get
//  *   description: This Api Is Query List Get
//  *   tags:
//  *    - Admin Query
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
//  *     description: SuccessFully Query List Get..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.get('/', queryListGet);

module.exports = routes;

