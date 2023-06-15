/**
 * connection.routes.js
 * @description :: routes of connection APIs
 */

const express = require('express');

const routes = express.Router();
const connectionController = require('../../../controller/mobile/v1/connectionController');

/**
 * @swagger
 * /mobile/v1/connection/request:
 *  post:
 *   summary: This API Is create user connection request.
 *   description: This API Is create user connection request.
 *   tags:
 *    - User Connection
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - userId
 *                 - connectionText
 *                 - type
 *              properties:
 *                 userId:
 *                   type: objectId
 *                   example: 6360fe665475a7f4836c24b8
 *                 connectionText:
 *                   type: string
 *                   example: "Hey Lets Connect and build some product together."
 *                 type:
 *                   type: string
 *                   example: "LIKE OR WORK"
 *   responses:
 *    200:
 *     description: SuccessFully User Query answer details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/request', connectionController.createConnectionRequest);

/**
 * @swagger
 * /mobile/v1/connection/reject:
 *  put:
 *   summary: This API is connection rejection of user.
 *   description: This API is connection rejection of user.
 *   tags:
 *    - User Connection
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - connectionId
 *              properties:
 *                 connectionId:
 *                   type: objectId
 *                   example: 6368a6a302b25e24a6ae5720
 *   responses:
 *    201:
 *     description: SuccessFully modify the connection related data.
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/reject', connectionController.connectionReject);

/**
 * @swagger
 * /mobile/v1/connection/accept:
 *  put:
 *   summary: This API is connection accepted of user.
 *   description: This API is connection accepted of user.
 *   tags:
 *    - User Connection
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - connectionId
 *              properties:
 *                 connectionId:
 *                   type: objectId
 *                   example: 6368a6a302b25e24a6ae5720
 *   responses:
 *    201:
 *     description: SuccessFully modify the connection related data.
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/accept', connectionController.connectionAccepted);

/**
 * @swagger
 * /mobile/v1/connection/pending:
 *  get:
 *   summary: This API is for user pending request get.
 *   description: This API is for user pending request get.
 *   tags:
 *    - User Connection
 *   responses:
 *    200:
 *     description: SuccessFully User Pending details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/pending', connectionController.totalPendingConnection);

/**
 * @swagger
 * /mobile/v1/connection/connectionCount:
 *  get:
 *   summary: This API is for user Connection request count get.
 *   description: This API is for user Connection request count get.
 *   tags:
 *    - User Connection
 *   responses:
 *    200:
 *     description: SuccessFully Connection Count Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/connectionCount', connectionController.connectionRequestCount);

/**
 * @swagger
 * /mobile/v1/connection/list:
 *  get:
 *   summary: This API is for user Connection List get.
 *   description: This API is for user Connection List get.
 *   tags:
 *    - User Connection
 *   parameters:
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: username
 *        example: jenish
 *      - in: query
 *        name: connectionType
 *        schema:
 *          type: string
 *          required: true
 *          description: connectionType
 *        example: LIKE/WORK
 *      - in: query
 *        name: page
 *        schema:
 *           type: number
 *        require: true
 *        description: PageNumber
 *        example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *           type: number
 *        require: true
 *        description: limit
 *        example: 10
 *   responses:
 *    200:
 *     description: SuccessFully Connection List Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/list', connectionController.connectionListBothMode);

/**
 * @swagger
 * /mobile/v1/connection/qr/accept:
 *  post:
 *   summary: This API Is Qr to Accept Connection
 *   description: This API Is Qr to Accept Connection
 *   tags:
 *    - User Connection
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - userId
 *                 - type
 *              properties:
 *                 userId:
 *                   type: objectId
 *                   example: 6360fe665475a7f4836c24b8
 *                 type:
 *                   type: string
 *                   example: "LIKE OR WORK"
 *   responses:
 *    200:
 *     description: SuccessFully User Query answer details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/qr/accept', connectionController.connectionQrAccept);

module.exports = routes;
