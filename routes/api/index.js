const express = require('express');
const userRoute = require('./users');

const router = express.Router();

router.use('/user', userRoute);

module.exports = router;