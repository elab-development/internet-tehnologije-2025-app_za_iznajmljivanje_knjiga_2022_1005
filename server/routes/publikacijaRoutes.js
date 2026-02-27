const express = require('express');
const router = express.Router();
const publikacijaController = require('../controllers/publikacijaController');

router.get('/', publikacijaController.getAll);
router.post('/', publikacijaController.create);
router.post('/proveri-knjigu', publikacijaController.proveriKnjigu);
router.delete('/:id', publikacijaController.delete);

module.exports = router;