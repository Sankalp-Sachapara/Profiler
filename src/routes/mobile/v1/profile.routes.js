/**
 * profile.routes.js
 * @description :: routes of user profile setup all APIs
 */

const express = require('express');
const {
  basicProfileSetup,
  likeMindedProfileSetup,
  workProfileSetup,
  userBothProfileDetailGet,
  userProfileSetting,
  fcmTokenAndDeviceUpdate,
  userIgnoreLikeProfile,
  userIgnoreWorkProfile,
  userAccountDelete,
  profileChatInitiate,
  verifyUser,
  socialLinkSetup,
  getSocialLinks,
  deleteSocialLink,
  displaySocialCategory,
} = require('../../../controller/mobile/v1/profileController');

const routes = express.Router();

/**
 * @swagger
 * /mobile/v1/profile/userAccount:
 *  delete:
 *   summary: This API is for user Account Delete
 *   description: This API is for user Account Delete
 *   tags:
 *    - User Profile
 *   responses:
 *    200:
 *     description: SuccessFully User Account Deleted..
 *    500:
 *     description : Some Errors Happens..
 */
routes.delete('/userAccount', userAccountDelete);

/**
 * @swagger
 * /mobile/v1/profile/fcmTokenAndDevice:
 *  put:
 *   summary: This API is for user FCM Token And Device Update
 *   description: This API is for user FCM Token And Device Update
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        fcmToken:
 *         type: string
 *         description: fcmToken of the user
 *         example: ""
 *        device:
 *         type: string
 *         description: device for the user
 *         example: android/ios
 *   responses:
 *    201:
 *     description: SuccessFully FCM Token And Device update
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/fcmTokenAndDevice', fcmTokenAndDeviceUpdate);

/**
 * @swagger
 * /mobile/v1/profile/basic:
 *  put:
 *   summary: This API is for user profile setup
 *   description: This API is for user profile setup
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: name of the user
 *         example: Parth
 *        dateOfBirth:
 *         type: string
 *         description: dateOfBirth for the user
 *         example: 2022-10-10T06:52:56.638+00:00
 *        gender:
 *         type: string
 *         description: gender for the user
 *         example: Male/Female/Other
 *        location:
 *           $ref: '#/definitions/location'
 *   responses:
 *    201:
 *     description: SuccessFully Profile basic details update
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/basic', basicProfileSetup);

/**
 * @swagger
 * /mobile/v1/profile/likeMinded:
 *  put:
 *   summary: This API is for user likeMinded profile Update
 *   description: This API is for user likeMinded profile Update
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        aboutMe:
 *         type: string
 *         example: i am parth
 *        education:
 *         type: string
 *         example: Graduate
 *        yearOfPassOut:
 *         type: number
 *         example: 2022
 *        institution:
 *         type: string
 *         example: Veer Narmada South Gujarat University
 *        openToWork:
 *         type: Boolean
 *         example: true
 *        link:
 *         type: string
 *         example: https://codeedoc.com
 *        images:
 *         example: []
 *        questions:
 *           $ref: '#/definitions/questionAnswer'
 *        interest:
 *         example: [6360fe665475a7f4836c24b8,6360fe665475a7f4836c24b8]
 *        language:
 *         example: [63663e417564a70c6cf03705,63663e417564a70c6cf03706]
 *   responses:
 *    201:
 *     description: SuccessFully LikeMinded Profile details update
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/likeMinded', likeMindedProfileSetup);

/**
 * @swagger
 * /mobile/v1/profile/work:
 *  put:
 *   summary: This API is for user work profile Update
 *   description: This API is for user Work profile Update
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        aboutMe:
 *         type: string
 *         example: i am parth
 *        education:
 *         type: string
 *         example: Graduate
 *        yearOfPassOut:
 *         type: number
 *         example: 2022
 *        institution:
 *         type: string
 *         example: Veer Narmada South Gujarat University
 *        openToWork:
 *         type: Boolean
 *         example: true
 *        link:
 *         type: string
 *         example: https://codeedoc.com
 *        jobRole:
 *         type: string
 *         example: Filming
 *        companyName:
 *         type: string
 *         example: NetBrahma
 *        industryType:
 *         type: string
 *         example: 636e414b8c7f88de5eafbc14
 *        experience:
 *         type: number
 *         example: 8
 *        images:
 *         example: []
 *        questions:
 *           $ref: '#/definitions/questionAnswer'
 *        skills:
 *         example: [6360fe665475a7f4836c24b8,6360fe665475a7f4836c24b8]
 *        language:
 *         example: [63663e417564a70c6cf03705,63663e417564a70c6cf03706]
 *   responses:
 *    201:
 *     description: SuccessFully Work Profile details update
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/work', workProfileSetup);

/**
 * @swagger
 * /mobile/v1/profile/socialCategory:
 *  get:
 *   summary: This API is for getting social links for user.
 *   description: This API is for getting social links for user.
 *   tags:
 *    - User Profile
 *   responses:
 *    200:
 *     description: SuccessFully Get social link list
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/socialCategory', displaySocialCategory);

/**
 * @swagger
 * /mobile/v1/profile/socialLinks/{userId}:
 *  get:
 *   summary: This API is for getting social links for user.
 *   description: This API is for getting social links for user.
 *   tags:
 *    - User Profile
 *   parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *           type: string
 *        require: true
 *        description: UserId
 *        example: 63620bdffae2066b79726c40
 *   responses:
 *    200:
 *     description: SuccessFully Get social link list
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/socialLinks/:userId', getSocialLinks);

/**
 * @swagger
 * /mobile/v1/profile/{userId}:
 *  get:
 *   summary: This API is for user All both profile Detail
 *   description: This API is for user All both profile Detail
 *   tags:
 *    - User Profile
 *   parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *           type: string
 *        require: true
 *        description: UserId
 *        example: 63620bdffae2066b79726c40
 *   responses:
 *    200:
 *     description: SuccessFully User Both Profile details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.get('/:userId', userBothProfileDetailGet);

/**
 * @swagger
 * /mobile/v1/profile/setting:
 *  put:
 *   summary: This API is for user Profile Setting Update
 *   description: This API is for user Profile Setting Update
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        incognito:
 *         type: boolean
 *        anonymousAnswering:
 *         type: boolean
 *        profileStatus:
 *          $ref: '#/definitions/activateMode'
 *        snooze:
 *          $ref: '#/definitions/snooze'
 *        location:
 *          $ref: '#/definitions/locationBoundary'
 *   responses:
 *    201:
 *     description: SuccessFully User Profile Setting Update
 *    500:
 *     description : Some Errors Happens..
 */
routes.put('/setting', userProfileSetting);

/**
 * @swagger
 * /mobile/v1/profile/ignore/like:
 *  post:
 *   summary: This Api Is  Ignore Like Profile.
 *   description: This Api Is  Ignore Like Profile.
 *   tags:
 *    - User Profile
 *   parameters:
 *      - in: query
 *        name: likeProfileId
 *        schema:
 *           type: string
 *        require: true
 *        description: like profile ignore UserId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully Like Profile Ignore..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/ignore/like', userIgnoreLikeProfile);

/**
 * @swagger
 * /mobile/v1/profile/ignore/work:
 *  post:
 *   summary: This Api Is  Ignore work Profile.
 *   description: This Api Is  Ignore work Profile.
 *   tags:
 *    - User Profile
 *   parameters:
 *      - in: query
 *        name: workProfileId
 *        schema:
 *           type: string
 *        require: true
 *        description: work profile ignore UserId
 *        example: 6363837eb094bdb82c0daea9
 *   responses:
 *    201:
 *     description: SuccessFully work Profile Ignore..
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/ignore/work', userIgnoreWorkProfile);

/**
 * @swagger
 * /mobile/v1/profile/chatInitiate:
 *  post:
 *   summary: This API is for user profile Chat Initiate
 *   description: This API is for user profile Chat Initiate
 *   tags:
 *    - User Profile
 *   parameters:
 *      - in: query
 *        name: userId
 *        schema:
 *           type: string
 *        require: true
 *        description: UserId
 *        example: 639fe65e1cde2fc274dcc46f
 *      - in: query
 *        name: profileType
 *        schema:
 *           type: string
 *        require: true
 *        description: profileType
 *        example: LIKE/WORK
 *   responses:
 *    200:
 *     description: SuccessFully User Both Profile details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/chatInitiate', profileChatInitiate);

/**
 * @swagger
 * /mobile/v1/profile/verify:
 *  post:
 *   summary: This API is for user profile Chat Initiate
 *   description: This API is for user profile Chat Initiate
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        image1:
 *         type: string
 *         description: This is first image
 *         example: base64
 *        image2:
 *         type: string
 *         description: This is second image to compare
 *         example: base64
 *   responses:
 *    200:
 *     description: SuccessFully User Both Profile details Get
 *    500:
 *     description : Some Errors Happens..
 */
routes.post('/verify', verifyUser);

/**
 * @swagger
 * /mobile/v1/profile/addSocialLinks:
 *  post:
 *   summary: This API is for user Profile link adding
 *   description: This API is for user Profile link adding
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        link:
 *         type: string
 *        categoryId:
 *         type: string
 *        isWorkProfile:
 *         type: boolean
 *        isLikeProfile:
 *         type: boolean
 *   responses:
 *    201:
 *     description: SuccessFully User Profile Social Link
 *    500:
 *     description : Some Errors Happens..
 */

routes.post('/addSocialLinks', socialLinkSetup);

/**
 * @swagger
 * /mobile/v1/profile/deleteSocialLinks:
 *  post:
 *   summary: This API is for user Profile link deletion
 *   description: This API is for user Profile link deletion
 *   tags:
 *    - User Profile
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        categoryId:
 *         type: string
 *   responses:
 *    201:
 *     description: SuccessFully deleted User Profile Social Link
 *    500:
 *     description : Some Errors Happens..
 */

routes.post('/deleteSocialLinks', deleteSocialLink);

/**
 * @swagger
 * definitions:
 *   activateMode:
 *       type: object
 *       properties:
 *        likeMinded:
 *         type: boolean
 *        work:
 *         type: boolean
 */

/**
 * @swagger
 * definitions:
 *   questionAnswer:
 *       type: object
 *       properties:
 *        questionId:
 *         type: string
 *         example: 636239e9c983971d427782ee
 *        name:
 *         type: string
 *         example: i am proud of ?
 *        answerType:
 *         type: string
 *         example: TEXT/AUDIO
 *        answer:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   snooze:
 *       type: object
 *       properties:
 *        oneDay:
 *         type: boolean
 *        oneWeek:
 *         type: boolean
 */

/**
 * @swagger
 * definitions:
 *   locationBoundary:
 *       type: object
 *       properties:
 *        withinCountry:
 *         type: boolean
 *        withinState:
 *         type: boolean
 */

/**
 * @swagger
 * definitions:
 *   location:
 *       type: object
 *       properties:
 *         longitude:
 *           example: 72.831062
 *         latitude:
 *           example: 21.170240
 *         city:
 *           example: surat
 *         state:
 *           example: gujarat
 *         country:
 *           example: india
 *         altitude:
 *           example: 10
 *         airPressure:
 *           example: 30.01
 */
module.exports = routes;
