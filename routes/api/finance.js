const express = require('express');

const router = express.Router();

const authController = require('../../middleware/auth');
const financeController = require('../../controllers/finance');

router.post('/mortgageCategory', financeController.addMortgageCategory);
router.get('/mortgageCategory', financeController.getMortgageCategory);

// router.post('/', authController, financeController.addCustomerFinanceDetails);
// router.get('/', authController, financeController.getCustomerFinance);

router.post('/cash', authController, financeController.addCustomerFinanceCashFlow);
router.post('/fix', authController, financeController.addCustomerFinanceFixFlow);
router.put('/cash', authController, financeController.editCustomerCashFinanceStatus);


module.exports = router;