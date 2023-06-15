/**
 * index.js
 * @description :: index route of platforms
 */

const express = require('express');

const router = express.Router();

router.use('/mobile/v1', require('./mobile/v1/index'));
router.use('/admin/v1', require('./admin/v1/index'));

module.exports = router;
