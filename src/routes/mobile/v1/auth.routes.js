/**
 * auth.routes.js
 * @description :: routes of authentication APIs
 */

const express = require('express');

const routes = express.Router();
const authController = require('../../../controller/mobile/v1/authController');
const webAuth = require('../../../middleware/webAuth');

/**
 * @swagger
 * /mobile/v1/auth/whatsApp:
 *  post:
 *   summary: This API is for whatsApp login of user
 *   description: This API is for whatsApp login of user
 *   tags: [ Auth]
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - token
 *                 - platform
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demofesvgrgthyjuyj7i8l7887l7909l09"
 *                 platform:
 *                   type: string
 *                   example: "ANDROID/IOS"
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */
routes.post('/whatsApp', authController.whatsAppLogin);

/**
 * @swagger
 * /mobile/v1/auth/facebook:
 *   post:
 *     summary: User Registration From Facebook.
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - token
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demo"
 *     responses:
 *       200:
 *         description: The post was successfully created
 *       500:
 *         description: Some server error
 */
routes.post('/facebook', authController.facebookLogin);

/**
 * @swagger
 * /mobile/v1/auth/google:
 *   post:
 *     summary: User Registration From Google..
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - token
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demo"
 *                 providerId:
 *                   type: string
 *                   example: "8987654987654"
 *     responses:
 *       200:
 *         description: The post was successfully created
 *       500:
 *         description: Some server error
 */
routes.post('/google', authController.googleLogin);

/**
 * @swagger
 * /mobile/v1/auth/sendOtp:
 *   post:
 *     summary: Otp send to user for Auth.
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - mobileNumber
 *                 - mobileCode
 *              properties:
 *                 mobileNumber:
 *                   type: string
 *                   example: "1324567890"
 *                 mobileCode:
 *                   type: string
 *                   example: "+91"
 *     responses:
 *       200:
 *         description: The post was successfully created
 *       500:
 *         description: Some server error
 */
routes.post('/sendOtp', webAuth, authController.sendOtp);

/**
 * @swagger
 * /mobile/v1/auth/verifyOtp:
 *   post:
 *     summary: Otp verify from user for Auth.
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - mobileNumber
 *                 - mobileCode
 *                 - otp
 *              properties:
 *                 mobileNumber:
 *                   type: string
 *                   example: "1324567890"
 *                 mobileCode:
 *                   type: string
 *                   example: "+91"
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *     responses:
 *       200:
 *         description: The post was successfully created
 *       500:
 *         description: Some server error
 */
routes.post('/verifyOtp', webAuth, authController.verifyOtp);

/**
 * @swagger
 * /mobile/v1/auth/tokenRefresh:
 *   post:
 *     summary: api for tokenRefresh.
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - token
 *                 - refreshToken
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demo"
 *                 refreshToken:
 *                   type: string
 *                   example: "demo"
 *     responses:
 *       200:
 *         description: The post check token and give refresh token
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demo"
 *                 refreshToken:
 *                   type: string
 *                   example: "demo"
 *       500:
 *         description: Some server error
 */
routes.post('/tokenRefresh', authController.tokenRefresh);

/**
 * @swagger
 * /mobile/v1/auth/checkToken:
 *   post:
 *     summary: checking token
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - token
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demo"
 *     responses:
 *       200:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                 token:
 *                   type: string
 *                   example: "demo"
 *                 refreshToken:
 *                   type: string
 *                   example: "demo"
 *       500:
 *         description: Some server error
 */
routes.post('/checkToken', authController.tokenCheck);

/**
 * @swagger
 * /mobile/v1/auth/whatsAppIntent:
 *   post:
 *     summary: get whats app url.
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - platform
 *                 - redirectionURL
 *              properties:
 *                 platform:
 *                   type: string
 *                   example: "ANDROID/IOS"
 *                 redirectionURL:
 *                   type: string
 *                   example: "https://profiler-app/mobile/v1/auth/whatsAppIntent"
 *     responses:
 *       200:
 *         description: The post was successfully created
 *       500:
 *         description: Some server error
 */
routes.post('/whatsAppIntent', authController.whatsAppGetUrl);

/**
 * @swagger
 * /mobile/v1/auth/logout:
 *   post:
 *     summary: User Logout
 *     tags: [ Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - refreshToken
 *              properties:
 *                 refreshToken:
 *                   type: string
 *                   example: "demo"
 *     responses:
 *       200:
 *         description: successfully User Logout
 *
 *       500:
 *         description: Some server error
 */
routes.post('/logout', webAuth, authController.userLogout);

/**
 * @swagger
 * /mobile/v1/auth/device/{deviceType}:
 *  get:
 *   summary: This API Is Get version
 *   description: This API Is Get version
 *   tags: [ Auth]
 *   parameters:
 *      - in: path
 *        name: deviceType
 *        schema:
 *           type: string
 *        require: true
 *        description: type of mobile device
 *        example: ANDROID,IOS
 *   responses:
 *    200:
 *     description: SuccessFully get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/device/:deviceType', authController.updateDialog);

module.exports = routes;

