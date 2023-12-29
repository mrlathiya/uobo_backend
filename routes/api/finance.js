const express = require('express');

const router = express.Router();

const authController = require('../../middleware/auth');
const financeController = require('../../controllers/finance');

router.post('/', authController, financeController.addCustomerFinanceDetails);
router.get('/', authController, financeController.getCustomerFinance);

module.exports = router;