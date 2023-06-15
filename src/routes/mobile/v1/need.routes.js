/**
 * need.routes.js
 * @description :: routes of user need setup all APIs
 */
const express = require('express');
const {
  userNeedAllAnswersGet,
  answeredListForCurrentUser,
  askedListForCurrentUser,
  answeredForNeed,
  createNeed,
  updateNeed,
  needAnswerRead,
  needClose,
  needIgnore,
  answeredRate,
  initiateChatWithUser,
  needDelete,
  needPause,
  needResume,
} = require('../../../controller/mobile/v1/needController');

const routes = express.Router();

/**
 * @swagger
 * /mobile/v1/need/{id}/answers:
 *  get:
 *   summary: This API Is For Specific Need All Answers Get
 *   description: This API Is For Specific Need All Answers Get
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: NeedId
 *        example: 636361ac47387d6f515e9d4d
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
 *     description: SuccessFully Specific Need All Answers Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/:id/answers', userNeedAllAnswersGet);

/**
 * @swagger
 * /mobile/v1/need/history/answered:
 *  get:
 *   summary: This Api Returns The List Of Questions That Were Answered By The Current User
 *   description: This Api Returns The List Of Questions That Were Answered By The Current User
 *   tags:
 *    - User Need
 *   parameters:
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
 *     description: SuccessFully Get List Of Questions That Were Answered By The Current User
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/history/answered', answeredListForCurrentUser);

/**
 * @swagger
 * /mobile/v1/need/history/asked:
 *  get:
 *   summary: This Api Returns The List Of Questions That Were Asked By The Current User
 *   description: This Api Returns The List Of Questions That Were Asked By The Current User
 *   tags:
 *    - User Need
 *   parameters:
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
 *     description: SuccessFully Get List Of Questions That Were Asked By The Current User
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/history/asked', askedListForCurrentUser);

/**
 * @swagger
 * /mobile/v1/need/answer:
 *  post:
 *   summary: This Api Is Answered For Need
 *   description: This Api Is Answered For Need
 *   tags:
 *    - User Need
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        needId:
 *         type: string
 *         description: needId
 *         example: 63620bdffae2066b79726c40
 *        answer:
 *         type: string
 *         description: needAnswer for the user
 *         example: yes i am interested
 *   responses:
 *    200:
 *     description: SuccessFully Answered For Need..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/answer', answeredForNeed);

/**
 * @swagger
 * /mobile/v1/need/{id}/answer/{answerId}/rate:
 *  post:
 *   summary: This API rate a specific answer out of 5 stars
 *   description: This API rate a specific answer out of 5 stars
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 63636d8147387d6f515e9d72
 *      - in: path
 *        name: answerId
 *        schema:
 *           type: string
 *        require: true
 *        description: answerId
 *        example: 6363a251e828c66405e8a252
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        rate:
 *         type: number
 *         description: rate
 *         example: 2
 *   responses:
 *    200:
 *     description: SuccessFully Answered Response As Rate(Star)
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/:id/answer/:answerId/rate', answeredRate);

/**
 * @swagger
 * /mobile/v1/need:
 *  post:
 *   summary: This Api Is Create Need
 *   description: This Api Is Create Need
 *   tags:
 *    - User Need
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        skill:
 *         type: array
 *         description: skill
 *         example: ["636234f4bdb3e00877422a4b"]
 *        interest:
 *         type: array
 *         description: interest
 *         example: ["636234f4bdb3e00877422a4f"]
 *        question:
 *         type: string
 *         description: needQuestion for the user
 *         example: Looking for Web Developer for E-commerce PlateForm ?
 *   responses:
 *    200:
 *     description: SuccessFully Create Need..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/', createNeed);

/**
 * @swagger
 * /mobile/v1/need/close:
 *  put:
 *   summary: This Api Is Need Close
 *   description: This Api Is Need Close
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: query
 *        name: needId
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 6363bc43475f6a83f30faf84
 *   responses:
 *    201:
 *     description: SuccessFully Need Close..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/close', needClose);

/**
 * @swagger
 * /mobile/v1/need/pause:
 *  put:
 *   summary: This API need pause
 *   description: This API need pause
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: query
 *        name: needId
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully need pause
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/pause', needPause);

/**
 * @swagger
 * /mobile/v1/need/resume:
 *  put:
 *   summary: This API need resume
 *   description: This API need resume
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: query
 *        name: needId
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully need resume
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/resume', needResume);

/**
 * @swagger
 * /mobile/v1/need/ignore:
 *  put:
 *   summary: This Api Is Need Ignore
 *   description: This Api Is Need Ignore
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: query
 *        name: needId
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 6363bc43475f6a83f30faf84
 *   responses:
 *    201:
 *     description: SuccessFully Need Ignore..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/ignore', needIgnore);

/**
 * @swagger
 * /mobile/v1/need/delete:
 *  put:
 *   summary: This Api Is Delete Need
 *   description: This Api Is Delete Need
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: query
 *        name: needId
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 6363a251e828c66405e8a252
 *   responses:
 *    201:
 *     description: SuccessFully Need Delete..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/delete', needDelete);

/**
 * @swagger
 * /mobile/v1/need/{id}:
 *  put:
 *   summary: This Api Is Update Need
 *   description: This Api Is Update Need
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: needId
 *        example: 6363bc43475f6a83f30faf84
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        skill:
 *         type: string
 *         description: skill
 *         example: ["636234f4bdb3e00877422a4b"]
 *        interest:
 *         type: string
 *         description: interest
 *         example: ["636234f4bdb3e00877422a4f"]
 *        question:
 *         type: string
 *         description: needQuestion for the user
 *         example: Looking for Web Developer for E-commerce PlateForm ?
 *   responses:
 *    201:
 *     description: SuccessFully Create Need..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/:id', updateNeed);

/**
 * @swagger
 * /mobile/v1/need/answer/read:
 *  put:
 *   summary: This Api Is Need Answer Read
 *   description: This Api Is Need Answer Read
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: query
 *        name: answerId
 *        schema:
 *           type: string
 *        require: true
 *        description: answerId
 *        example: 6363a251e828c66405e8a252
 *   responses:
 *    201:
 *     description: SuccessFully Need Answer Read..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/answer/read', needAnswerRead);

/**
 * @swagger
 * /mobile/v1/need/{id}/chat:
 *  post:
 *   summary: This Api Is Initiate Chat With User
 *   description: This Api Is Initiate Chat With User
 *   tags:
 *    - User Need
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: answerId
 *        example: 636368f947387d6f515e9d6a
 *   responses:
 *    200:
 *     description: SuccessFully Initiate Chat With User..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/:id/chat', initiateChatWithUser);

module.exports = routes;

