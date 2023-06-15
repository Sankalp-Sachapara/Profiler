const express = require('express');
const {
  feedsWorkSearch,
  feedsLikeSearch,
  feedsNeedSearch,
  feedsQuerySearch,
  bothProfileSearch,
} = require('../../../controller/mobile/v1/feedsController');

const routes = express.Router();

/**
 * @swagger
 * /mobile/v1/feeds/work:
 *  get:
 *   summary: This API Is For User Work Profile List Get
 *   description: This API Is For User Work Profile List Get
 *   tags:
 *    - User Feeds
 *   parameters:
 *      - in: query
 *        name: radius
 *        schema:
 *          type: number
 *          require: true
 *          description: radius for location range
 *        example: 100
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *          description: city of user
 *        example: surat
 *      - in: query
 *        name: openToWork
 *        schema:
 *          type: boolean
 *          description: openToWork for work
 *      - in: query
 *        name: skill
 *        schema:
 *          type: array
 *          require: true
 *          description: Skill
 *        example: ['63997a04ca7c218ddeaed4f6','63997a04ca7c218ddeaed4f7']
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: Name of user to find.
 *        example: "Username"
 *      - in: query
 *        name: language
 *        schema:
 *          type: array
 *          require: true
 *          description: Language
 *        example: ['English','Hindi']
 *      - in: query
 *        name: industry
 *        schema:
 *          type: array
 *          require: true
 *          description: id of the Industry Type.
 *        example: ['63997a05ca7c218ddeaed4fe','63997a05ca7c218ddeaed4ff']
 *      - in: query
 *        name: experience
 *        schema:
 *          type: number
 *          require: true
 *          description: number of experience.
 *        example: 3
 *      - in: query
 *        name: experienceType
 *        schema:
 *          type: string
 *          description: experience to up or down data.
 *        example: "gt,lt"
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
 *     description: SuccessFully Work Profile List Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/work', feedsWorkSearch);

/**
 * @swagger
 * /mobile/v1/feeds/like:
 *  get:
 *   summary: This API Is For User Like Profile List Get
 *   description: This API Is For User Like Profile List Get
 *   tags:
 *    - User Feeds
 *   parameters:
 *      - in: query
 *        name: radius
 *        schema:
 *          type: number
 *          require: true
 *          description: radius for location range
 *        example: 100
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *          description: city of user
 *        example: surat
 *      - in: query
 *        name: interest
 *        schema:
 *          type: array
 *          require: true
 *          description: interest
 *        example: ['63997a07ca7c218ddeaed502','63997a07ca7c218ddeaed503']
 *      - in: query
 *        name: language
 *        schema:
 *          type: array
 *          require: true
 *          description: Language
 *        example: ['English','Hindi']
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: Name of user to find.
 *        example: "Username"
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
 *     description: SuccessFully Like Profile List Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/like', feedsLikeSearch);

/**
 * @swagger
 * /mobile/v1/feeds/need:
 *  get:
 *   summary: This API Is For User Need List Get
 *   description: This API Is For User Need List Get
 *   tags:
 *    - User Feeds
 *   parameters:
 *      - in: query
 *        name: skillOrInterest
 *        schema:
 *          type: array
 *          require: true
 *          description: skillOrInterest
 *        example: ['63997a07ca7c218ddeaed502','63997a07ca7c218ddeaed503']
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
 *     description: SuccessFully Need List Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/need', feedsNeedSearch);

/**
 * @swagger
 * /mobile/v1/feeds/query:
 *  get:
 *   summary: This API Is For User Query List Get
 *   description: This API Is For User Query List Get
 *   tags:
 *    - User Feeds
 *   parameters:
 *      - in: query
 *        name: skillOrInterest
 *        schema:
 *          type: array
 *          require: true
 *          description: skillOrInterest
 *        example: ['63997a07ca7c218ddeaed502','63997a07ca7c218ddeaed503']
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
 *     description: SuccessFully Query List Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/query', feedsQuerySearch);

/**
 * @swagger
 * /mobile/v1/feeds/profile/search:
 *  get:
 *   summary: This API Is For searching user irrespective of their profile
 *   description: This API Is For searching user irrespective of their profile
 *   tags:
 *    - User Feeds
 *   parameters:
 *      - in: query
 *        name: radius
 *        schema:
 *          type: number
 *          require: true
 *          description: radius for location range
 *        example: 100
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *          description: city of user
 *        example: surat
 *      - in: query
 *        name: openToWork
 *        schema:
 *          type: boolean
 *          description: openToWork for work
 *      - in: query
 *        name: skill
 *        schema:
 *          type: array
 *          require: true
 *          description: Skill
 *        example: ['63997a04ca7c218ddeaed4f6','63997a04ca7c218ddeaed4f7']
 *      - in: query
 *        name: language
 *        schema:
 *          type: array
 *          require: true
 *          description: Language
 *        example: ['English','Hindi']
 *      - in: query
 *        name: industry
 *        schema:
 *          type: array
 *          require: true
 *          description: id of the Industry Type.
 *        example: ['63997a05ca7c218ddeaed4fe','63997a05ca7c218ddeaed4ff']
 *      - in: query
 *        name: interest
 *        schema:
 *          type: array
 *          require: true
 *          description: interest
 *        example: ['63997a07ca7c218ddeaed502','63997a07ca7c218ddeaed503']
 *      - in: query
 *        name: experience
 *        schema:
 *          type: number
 *          require: true
 *          description: number of experience.
 *        example: 3
 *      - in: query
 *        name: experienceType
 *        schema:
 *          type: string
 *          description: experience to up or down data.
 *        example: "gt,lt"
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: Name of user to find.
 *        example: "Username"
 *      - in: query
 *        name: keyword
 *        schema:
 *          type: string
 *          description: keyword to search, this can be name of location or person or skill or interest.
 *        example: "someKey"
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
 *     description: SuccessFully Work Profile List Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/profile/search', bothProfileSearch);

module.exports = routes;

