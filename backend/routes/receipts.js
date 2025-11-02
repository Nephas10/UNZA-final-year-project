const express = require('express');
const router = express.Router();
const receiptCont = require('../contollers/receiptController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, receiptCont.getAllReceipts);
router.get('/invoice/:invoiceId', authMiddleware, receiptCont.getReceiptByInvoiceId);

module.exports = router;