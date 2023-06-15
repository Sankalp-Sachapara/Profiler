/**
 * index.js
 * @description :: index route file of device platform.
 */

const express = require('express');

const router = express.Router();
router.use('/skill', require('./skill.routes'));
router.use('/language', require('./language.routes'));
router.use('/interest', require('./interest.routes'));
router.use('/industryType', require('./industryType.routes'));
router.use('/question', require('./question.routes'));
router.use('/suggestion', require('./suggestion.routes'));
router.use('/user', require('./user.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/query', require('./query.routes'));
router.use('/need', require('./need.routes'));
router.use('/socialLinkCategory', require('./socialLinkCategory.routes'));
router.use('/bugType', require('./bugType.routes'));

module.exports = router;
