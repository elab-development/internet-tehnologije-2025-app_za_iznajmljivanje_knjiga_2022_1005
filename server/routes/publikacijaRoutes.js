const express = require('express');
const router = express.Router();
const publikacijaController = require('../controllers/publikacijaController');

router.get('/', publikacijaController.getAll);
router.post('/', publikacijaController.create);
router.post('/proveri-knjigu', publikacijaController.proveriKnjigu); 

module.exports = router;