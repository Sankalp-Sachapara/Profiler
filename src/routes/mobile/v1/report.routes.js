/**
 * report.routes.js
 * @description :: routes of user report APIs
 */

const express = require('express');

const routes = express.Router();
const reportController = require('../../../controller/mobile/v1/reportController');

/**
 * @swagger
 * /mobile/v1/report:
 *  post:
 *   summary: This API Is create report for like/work/need/query/user.
 *   description: This API Is create report for like/work/need/query/user.
 *   tags:
 *    - Report
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - reportUserId
 *                 - text
 *              properties:
 *                 reportId:
 *                   type: objectId
 *                   example: 6360fe665475a7f4836c24b8
 *                 reportTag:
 *                   type: string
 *                   example: USER/LIKE/WORK/NEED/QUERY
 *                 text:
 *                   type: string
 *                   example: "Reason Of Report"
 *   responses:
 *    200:
 *     description: SuccessFully Report Create
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/', reportController.createReport);

module.exports = routes;

