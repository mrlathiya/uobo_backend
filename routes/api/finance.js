const express = require('express');

const router = express.Router();

const authController = require('../../middleware/auth');
const commonAuthController = require('../../middleware/commonAuth');
const financeController = require('../../controllers/finance');

router.post('/mortgageCategory', financeController.addMortgageCategory);
router.get('/mortgageCategory', financeController.getMortgageCategory);

// router.post('/', authController, financeController.addCustomerFinanceDetails);
// router.get('/', authController, financeController.getCustomerFinance);

router.post('/cash', commonAuthController, financeController.addCustomerFinanceCashFlow);
router.post('/fix', commonAuthController, financeController.addCustomerFinanceFixFlow);
router.put('/cash', commonAuthController, financeController.editCustomerCashFinanceStatus);
router.put('/fix', commonAuthController, financeController.editCustomerFixFinanceStatus);

router.get('/customerRequested', commonAuthController, financeController.getCustomerRequestedOrder);


module.exports = router;