const express = require('express');
const router = express.Router();
const cliController = require('../contollers/cliController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, cliController.getClients);
router.post('/', authMiddleware, cliController.createClient);  
router.get('/:id', authMiddleware, cliController.getClientById);
router.put('/:id', authMiddleware, cliController.updateClient);
router.delete('/:id', authMiddleware, cliController.deleteClient);


module.exports = router;