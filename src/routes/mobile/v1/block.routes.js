/**
 * block.routes.js
 * @description :: routes of user block APIs
 */

const express = require('express');

const routes = express.Router();
const blockController = require('../../../controller/mobile/v1/blockController');

/**
 * @swagger
 * /mobile/v1/block/list:
 *  get:
 *   summary: This API is for block user All both profile Detail
 *   description: This API is for block user All both profile Detail
 *   tags:
 *    - User Block
 *   responses:
 *    200:
 *     description: SuccessFully Block User Both Profile details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/list', blockController.blockUserList);

/**
 * @swagger
 * /mobile/v1/block/user:
 *  post:
 *   summary: This API Is create user Block.
 *   description: This API Is create user Block.
 *   tags:
 *    - User Block
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - userId
 *              properties:
 *                 userId:
 *                   type: objectId
 *                   example: 6360fe665475a7f4836c24b8
 *   responses:
 *    200:
 *     description: SuccessFully User Block.
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/user', blockController.userBlock);

/**
 * @swagger
 * /mobile/v1/block/userUnblock:
 *  delete:
 *   summary: This API Is  user UnBlock.
 *   description: This API Is user UnBlock.
 *   tags:
 *    - User Block
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - userId
 *              properties:
 *                 userId:
 *                   type: objectId
 *                   example: 6360fe665475a7f4836c24b8
 *   responses:
 *    200:
 *     description: SuccessFully User UnBlock.
 *    500:
 *     description : Some Errors Happens..
 */
routes.delete('/userUnblock', blockController.userUnblock);

module.exports = routes;

