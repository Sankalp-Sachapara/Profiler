/**
 * socialLinkategory.routes.js
 * @description :: routes of user social Link category setup all APIs
 */
const express = require('express');
const {
  addSocialLinkCategory,
} = require('../../../controller/admin/v1/socialLinkCategoryController');

const routes = express.Router();

// /**
//  * @swagger
//  * /admin/v1/socialLinkCategory:
//  *  post:
//  *   summary: This Api Is Create social Link Category
//  *   description: This Api Is Create social Link Category
//  *   tags:
//  *    - Admin
//  *   requestBody:
//  *    content:
//  *     application/json:
//  *      schema:
//  *       type: object
//  *       properties:
//  *        name:
//  *         type: string
//  *         example: facebook
//  *        icon:
//  *         type: string
//  *         example: base64
//  *        link:
//  *         type: string
//  *         example: https://www.baseUrl.com
//  *   responses:
//  *    200:
//  *     description: SuccessFully Create Language..
//  *    500:
//  *     description : Some Errors Happens..
//  */
routes.post('/', addSocialLinkCategory);

module.exports = routes;
