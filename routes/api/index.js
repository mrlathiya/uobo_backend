const express = require('express');
const userRoute = require('./users');
const dealerRoute = require('./dealer');
const carRoute = require('./car');

const router = express.Router();

router.use('/user', userRoute);
router.use('/dealer', dealerRoute);
router.use('/car', carRoute)

module.exports = router;