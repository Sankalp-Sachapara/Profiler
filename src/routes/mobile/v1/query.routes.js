/**
 * query.routes.js
 * @description :: routes of authentication APIs
 */

const express = require('express');

const routes = express.Router();
const queryController = require('../../../controller/mobile/v1/queryController');

/**
 * @swagger
 * /mobile/v1/query/close:
 *  put:
 *   summary: This API Query Close
 *   description: This API Query Close
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: query
 *        name: queryId
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully Query Close
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/close', queryController.queryClose);

/**
 * @swagger
 * /mobile/v1/query/pause:
 *  put:
 *   summary: This API Query pause
 *   description: This API Query pause
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: query
 *        name: queryId
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully Query pause
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/pause', queryController.queryPause);

/**
 * @swagger
 * /mobile/v1/query/resume:
 *  put:
 *   summary: This API Query resume
 *   description: This API Query resume
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: query
 *        name: queryId
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully Query resume
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/resume', queryController.queryResume);

/**
 * @swagger
 * /mobile/v1/query/delete:
 *  put:
 *   summary: This API Query delete
 *   description: This API Query delete
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: query
 *        name: queryId
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully Query delete
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/delete', queryController.queryDelete);

/**
 * @swagger
 * /mobile/v1/query/ignore:
 *  put:
 *   summary: This Api Is Query Ignore
 *   description: This Api Is Query Ignore
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: query
 *        name: queryId
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully Query Ignore..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/ignore', queryController.queryIgnore);

/**
 * @swagger
 * /mobile/v1/query/{id}:
 *  put:
 *   summary: This Api Is Update Query
 *   description: This Api Is Update Query
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 6363837eb094bdb82c0daea9
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        question:
 *         type: string
 *         example: should i shift career?
 *        skill:
 *         example: [636234f4bdb3e00877422a4c]
 *        interest:
 *         example: [636234f4bdb3e00877422a50]
 *        anonymous:
 *         example: true/false
 *   responses:
 *    201:
 *     description: SuccessFully Update Query
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/:id', queryController.queryUpdate);

/**
 * @swagger
 * /mobile/v1/query/answer/read:
 *  put:
 *   summary: This API is Query Answer Read..
 *   description: This API is Query Answer Read..
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: query
 *        name: answerId
 *        schema:
 *           type: string
 *        require: true
 *        description: queryAnswerId
 *        example: 6363860fb094bdb82c0daeb8
 *   responses:
 *    201:
 *     description: SuccessFully Query Answer Read..
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/answer/read', queryController.queryAnswerRead);

/**
 * @swagger
 * /mobile/v1/query/{id}/answers:
 *  get:
 *   summary: This API Is Specific Query Answers List Detail.
 *   description: This API Is Specific Query Answers List Detail.
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 63638165d558eb65960a58e8
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
 *     description: SuccessFully User Query answer details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/:id/answers', queryController.userAllQueryAnswerGet);

/**
 * @swagger
 * /mobile/v1/query/history/answered:
 *  get:
 *   summary: This api returns the list of questions that were answered by the current user.
 *   description: This api returns the list of questions that were answered by the current user.
 *   tags:
 *    - User Query
 *   parameters:
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
 *     description: SuccessFully get the list of questions that were answered by the current user.
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/history/answered', queryController.userQuestionAnswered);

/**
 * @swagger
 * /mobile/v1/query/history/asked:
 *  get:
 *   summary: This api returns the list of questions that were asked by the current user.
 *   description: This api returns the list of questions that were asked by the current user.
 *   tags:
 *    - User Query
 *   parameters:
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
 *     description: SuccessFully get the list of questions that were asked by the current user.
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/history/asked', queryController.userQuestionAsked);

/**
 * @swagger
 * /mobile/v1/query/{id}/answer/{answerId}/rate:
 *  post:
 *   summary: This API rate a specific answer out of 5 stars
 *   description: This API rate a specific answer out of 5 stars
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: queryId
 *        example: 63638165d558eb65960a58e8
 *      - in: path
 *        name: answerId
 *        schema:
 *           type: string
 *        require: true
 *        description: answerId
 *        example: 6363860fb094bdb82c0daeb8
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
routes.post('/:id/answer/:answerId/rate', queryController.answeredRate);

/**
 * @swagger
 * /mobile/v1/query:
 *  post:
 *   summary: This Api Is Create Query.
 *   description: This Api Is Create Query.
 *   tags:
 *    - User Query
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - question
 *                 - skill
 *                 - interest
 *                 - anonymous
 *              properties:
 *                 question:
 *                   type: string
 *                   example: "should i shift career?"
 *                 skill:
 *                   type: array
 *                   example: ["636234f4bdb3e00877422a4c"]
 *                 interest:
 *                   type: array
 *                   example: ["636234f4bdb3e00877422a50"]
 *                 anonymous:
 *                   type: boolean
 *                   example: true/false
 *   responses:
 *    200:
 *     description: SuccessFully Create Need
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/', queryController.addQuery);

/**
 * @swagger
 * /mobile/v1/query/answer:
 *  post:
 *   summary: This API is for Answered the query.
 *   description: This API is for Answered the query.
 *   tags:
 *    - User Query
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              required:
 *                 - queryId
 *                 - queryAnswer
 *              properties:
 *                 queryId:
 *                   type: string
 *                   example: 63620bdffae2066b79726c40
 *                 queryAnswer:
 *                   type: string
 *                   example: "yes you can."
 *   responses:
 *    200:
 *     description: SuccessFully Answered The Query
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/answer', queryController.queryAnswer);

/**
 * @swagger
 * /mobile/v1/query/{id}/chat:
 *  post:
 *   summary: This Api Is Initiate Chat With User
 *   description: This Api Is Initiate Chat With User
 *   tags:
 *    - User Query
 *   parameters:
 *      - in: path
 *        name: id
 *        schema:
 *           type: string
 *        require: true
 *        description: answerId
 *        example: 6363860fb094bdb82c0daeb8
 *   responses:
 *    200:
 *     description: SuccessFully Initiate Chat With User..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/:id/chat', queryController.initiateChatWithUser);

module.exports = routes;

