const express = require('express');
const router = express.Router();
const zaduzenjaController = require('../controllers/zaduzenjaController');

router.get('/student/:id', zaduzenjaController.getZaduzenjaByStudent);

module.exports = router;
