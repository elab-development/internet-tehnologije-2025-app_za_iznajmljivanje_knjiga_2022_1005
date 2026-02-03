const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const korisniciController = require('../controllers/korisniciController');

router.get('/', auth, korisniciController.getAll);
router.patch('/:id/deaktiviraj', auth, korisniciController.deaktiviraj);

module.exports = router;
