const express = require('express');
const router = express.Router();
const quotationController = require('../contollers/quotationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, quotationController.createQuote);
router.get('/', authMiddleware, quotationController.getQuotations);
router.get('/:id', authMiddleware, quotationController.getQuotationById);
router.put('/:id/status', authMiddleware, quotationController.updateQuotationStatus);

module.exports = router;