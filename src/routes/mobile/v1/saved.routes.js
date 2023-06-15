/**
 * saved.routes.js
 * @description :: routes of user saved setup all APIs
 */
const express = require('express');
const {
  createSavedOrRemove,
  savedLikeProfileListGet,
  savedWorkProfileListGet,
  savedQueryListGet,
  savedNeedListGet,
} = require('../../../controller/mobile/v1/savedController');

const routes = express.Router();

/**
 * @swagger
 * /mobile/v1/saved:
 *  post:
 *   summary: This Api Is Create Saved
 *   description: This Api Is Create Saved
 *   tags:
 *    - User Saved
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        objectId:
 *         type: string
 *         example: 6363bc43475f6a83f30faf84
 *        status:
 *         type: boolean
 *         example: false
 *        type:
 *         type: string
 *         example: LIKE/WORK/NEED/QUERY
 *   responses:
 *    200:
 *     description: SuccessFully Create Saved..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/', createSavedOrRemove);

/**
 * @swagger
 * /mobile/v1/saved/like:
 *  get:
 *   summary: This Api Is Saved Like Profile List Get
 *   description: This Api Is Saved Like Profile List Get
 *   tags:
 *    - User Saved
 *   parameters:
 *      - in: query
 *        name: city
 *        schema:
 *           type: string
 *        require: true
 *        description: city name
 *        example: surat
 *      - in: query
 *        name: userName
 *        schema:
 *           type: string
 *        require: true
 *        description: userName
 *      - in: query
 *        name: page
 *        schema:
 *           type: number
 *        require: true
 *        description: number of page
 *        example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *           type: number
 *        require: true
 *        description: number of data limit
 *        example: 10
 *   responses:
 *    200:
 *     description: SuccessFully Saved Like Profile List Get...
 *    204:
 *     description: No Content..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/like', savedLikeProfileListGet);

/**
 * @swagger
 * /mobile/v1/saved/work:
 *  get:
 *   summary: This Api Is Saved Work Profile List Get
 *   description: This Api Is Saved Work Profile List Get
 *   tags:
 *    - User Saved
 *   parameters:
 *      - in: query
 *        name: city
 *        schema:
 *           type: string
 *        require: true
 *        description: city name
 *        example: surat
 *      - in: query
 *        name: userName
 *        schema:
 *           type: string
 *        require: true
 *        description: userName
 *      - in: query
 *        name: page
 *        schema:
 *           type: number
 *        require: true
 *        description: number of page
 *        example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *           type: number
 *        require: true
 *        description: number of data limit
 *        example: 10
 *   responses:
 *    200:
 *     description: SuccessFully Saved Work Profile List Get...
 *    204:
 *     description: No Content..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/work', savedWorkProfileListGet);

/**
 * @swagger
 * /mobile/v1/saved/query:
 *  get:
 *   summary: This Api Is Saved Query List Get
 *   description: This Api Is Saved Query List Get
 *   tags:
 *    - User Saved
 *   parameters:
 *      - in: query
 *        name: city
 *        schema:
 *           type: string
 *        require: true
 *        description: city name
 *        example: surat
 *      - in: query
 *        name: userName
 *        schema:
 *           type: string
 *        require: true
 *        description: userName
 *      - in: query
 *        name: page
 *        schema:
 *           type: number
 *        require: true
 *        description: number of page
 *        example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *           type: number
 *        require: true
 *        description: number of data limit
 *        example: 10
 *   responses:
 *    200:
 *     description: SuccessFully Saved Query List Get...
 *    204:
 *     description: No Content..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/query', savedQueryListGet);

/**
 * @swagger
 * /mobile/v1/saved/need:
 *  get:
 *   summary: This Api Is Saved Need List Get
 *   description: This Api Is Saved Need List Get
 *   tags:
 *    - User Saved
 *   parameters:
 *      - in: query
 *        name: city
 *        schema:
 *           type: string
 *        require: true
 *        description: city name
 *        example: surat
 *      - in: query
 *        name: userName
 *        schema:
 *           type: string
 *        require: true
 *        description: userName
 *      - in: query
 *        name: page
 *        schema:
 *           type: number
 *        require: true
 *        description: number of page
 *        example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *           type: number
 *        require: true
 *        description: number of data limit
 *        example: 10
 *   responses:
 *    200:
 *     description: SuccessFully Saved Need List Get...
 *    204:
 *     description: No Content..
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/need', savedNeedListGet);

module.exports = routes;

