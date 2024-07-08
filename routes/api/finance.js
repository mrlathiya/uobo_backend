const express = require('express');

const router = express.Router();

const authController = require('../../middleware/auth');
const dealerAuthController = require('../../middleware/dealerAuth');
const commonAuthController = require('../../middleware/commonAuth');
const financeController = require('../../controllers/finance');
const multer = require('multer');

const storage = multer.memoryStorage();
const uploadFile = multer({ storage: storage });

router.post('/mortgageCategory', financeController.addMortgageCategory);
router.get('/mortgageCategory', financeController.getMortgageCategory);

// router.post('/', authController, financeController.addCustomerFinanceDetails);
// router.get('/', authController, financeController.getCustomerFinance);
router.get('/order', financeController.getFinanceOrder)

router.post('/cash', authController, financeController.addCustomerFinanceCashFlow);
router.post('/fix', commonAuthController, financeController.addCustomerFinanceFixFlow);

router.put('/cash', commonAuthController, financeController.editCustomerCashFinanceStatus);
router.put('/fix', commonAuthController, financeController.editCustomerFixFinanceStatus);

router.post('/withoutcar', authController, financeController.addCustomerWithoutCarOrder);
router.put('/withoutcar', commonAuthController, financeController.editCustomerWithoutCarStatus);

router.get('/liveOrders', dealerAuthController, financeController.getCustomerRequestedOrder);

router.post('/sendEnvelope', uploadFile.single('file'), financeController.sendDocuSignDoc);


module.exports = router;