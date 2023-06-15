/**
 * profile.routes.js
 * @description :: routes of like and work profile API
 */
const express = require('express');
const {
  likeProfileListGet,
  workProfileListGet,
} = require('../../../controller/admin/v1/profileController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/profile/like:
//  *  get:
//  *   summary: This Api Is Like Profile List Get
//  *   description: This Api Is Like Profile List Get
//  *   tags:
//  *    - Admin Profile
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
//  *     description: SuccessFully Like Profile List Get..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.get('/like', likeProfileListGet);

// /**
//  * @swagger
//  * /admin/v1/profile/work:
//  *  get:
//  *   summary: This Api Is Work Profile List Get
//  *   description: This Api Is Work Profile List Get
//  *   tags:
//  *    - Admin Profile
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
//  *     description: SuccessFully Work Profile List Get..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.get('/work', workProfileListGet);

module.exports = routes;

