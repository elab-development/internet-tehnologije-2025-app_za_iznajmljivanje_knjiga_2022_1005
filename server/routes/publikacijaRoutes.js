const express = require('express');
const router = express.Router();
const publikacijaController = require('../controllers/publikacijaController');


router.get('/', publikacijaController.getAll);

module.exports = router;