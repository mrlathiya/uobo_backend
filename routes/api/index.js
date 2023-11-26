const express = require('express');
const userRoute = require('./users');
const dealerRoute = require('./dealer');

const router = express.Router();

router.use('/user', userRoute);
router.use('/dealer', dealerRoute);

module.exports = router;