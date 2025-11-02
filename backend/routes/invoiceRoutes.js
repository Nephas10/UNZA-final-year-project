const express = require('express');
const router = express.Router();
const invoiceController = require('../contollers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, invoiceController.createInvoice);
router.get('/', authMiddleware, invoiceController.getInvoices);
router.get('/:id', authMiddleware, invoiceController.getInvoicesById);
router.put('/:id/status', authMiddleware, invoiceController.updateInvoicestatus);

module.exports = router;