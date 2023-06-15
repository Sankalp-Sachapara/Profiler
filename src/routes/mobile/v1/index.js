/**
 * index.js
 * @description :: index route file of device platform.
 */

const express = require('express');
const webAuth = require('../../../middleware/webAuth');

const router = express.Router();
router.use('/auth', require('./auth.routes'));
router.use('/profile', webAuth, require('./profile.routes'));
router.use('/query', webAuth, require('./query.routes'));
router.use('/connection', webAuth, require('./connection.routes'));
router.use('/need', webAuth, require('./need.routes'));
router.use('/saved', webAuth, require('./saved.routes'));
router.use('/skill', webAuth, require('./skill.routes'));
router.use('/interest', webAuth, require('./interest.routes'));
router.use('/question', webAuth, require('./question.routes'));
router.use('/language', webAuth, require('./language.routes'));
router.use('/industryType', webAuth, require('./industryType.routes'));
router.use('/feeds', webAuth, require('./feed.routes'));
router.use('/userSetting', webAuth, require('./userSetting.routes'));
router.use('/notification', webAuth, require('./notification.routes'));
router.use('/chat', webAuth, require('./chat.routes'));
router.use('/suggestion', webAuth, require('./suggestion.routes'));
router.use('/report', webAuth, require('./report.routes'));
router.use('/block', webAuth, require('./block.routes'));
router.use('/bug', webAuth, require('./bug.routes'));

module.exports = router;
