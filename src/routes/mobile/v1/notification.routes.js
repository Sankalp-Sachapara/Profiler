/**
 * notification.routes.js
 * @description :: routes of notification APIs
 */

const express = require('express');

const routes = express.Router();

const notificationController = require('../../../controller/mobile/v1/notificationController');

/**
 * @swagger
 * /mobile/v1/notification/read:
 *  post:
 *   summary: This API Is read Notification.
 *   description: This API Is read Notification.
 *   tags:
 *    - User Notification
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - notification
 *              properties:
 *                 notification:
 *                   type: array
 *                   example: [6369d752c9516cd7c8cc39c6,6369d7a268530665c2a4316b]
 *   responses:
 *    200:
 *     description: SuccessFully User read notification.
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/read', notificationController.notificationRead);

/**
 * @swagger
 * /mobile/v1/notification:
 *  get:
 *   summary: This API Is get New Notification.
 *   description: This API Is get New Notification.
 *   tags:
 *    - User Notification
 *   parameters:
 *      - in: query
 *        name: lastNotificationId
 *        schema:
 *           type: string
 *        require: true
 *        description: lastNotificationId
 *        example: 6369e09c7a2796ee3c538134
 *      - in: query
 *        name: pageSize
 *        schema:
 *           type: number
 *        require: true
 *        description: pageSize
 *        example: 10
 *   responses:
 *    200:
 *     description: SuccessFully User get new notification.
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/', notificationController.notificationGet);

module.exports = routes;

