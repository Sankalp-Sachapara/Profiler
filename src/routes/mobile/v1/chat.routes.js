/**
 * chat.routes.js
 * @description :: routes of chat APIs
 */

const express = require('express');

const routes = express.Router();
const chatController = require('../../../controller/mobile/v1/chatController');
const webAuth = require('../../../middleware/webAuth');

/**
 * @swagger
 * /mobile/v1/chat/:
 *  post:
 *   summary: This API is for image and audio base64 store in s3
 *   description: This API is for image and audio base64 store in s3
 *   tags: [ CHAT]
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                 base64:
 *                   type: string
 *                   example: ""
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */
routes.post('/', webAuth, chatController.chatImageAndPdfStore);

module.exports = routes;

