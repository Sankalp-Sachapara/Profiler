/**
 * bug.routes.js
 * @description :: routes of Bug Report setup all APIs
 */

const express = require('express');

const {
  bugReport,
  getBugReports,
  displayBugType,
} = require('../../../controller/mobile/v1/bugController');

const routes = express.Router();

/**
 * @swagger
 * /mobile/v1/bug/bugTypeList:
 *  get:
 *   summary: This API is for getting list of bugs reported by user.
 *   description: This API is for getting list of bugs reported byuser.
 *   tags:
 *    - User Bug
 *   responses:
 *    200:
 *     description: SuccessFully displayed bug reports
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/bugTypeList', displayBugType);

/**
 * @swagger
 * /mobile/v1/bug/bugReportList:
 *  get:
 *   summary: This API is for getting list of bugs reported by user.
 *   description: This API is for getting list of bugs reported byuser.
 *   tags:
 *    - User Bug
 *   responses:
 *    200:
 *     description: SuccessFully displayed bug reports
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/bugReportList', getBugReports);

/**
 * @swagger
 * /mobile/v1/bug/reportBug:
 *  post:
 *   summary: This API is for user bug Reporting
 *   description: This API is for user bug Reporting
 *   tags:
 *    - User Bug
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        bugTypeId:
 *         type: string
 *        issue:
 *         type: string
 *        images:
 *         example: []
 *        deviceInfo:
 *         type: string
 *         example: deviceInfo
 *   responses:
 *    201:
 *     description: SuccessFully reported the bug
 *    500:
 *     description : Some Errors Happens..
 */

routes.post('/reportBug', bugReport);

module.exports = routes;
