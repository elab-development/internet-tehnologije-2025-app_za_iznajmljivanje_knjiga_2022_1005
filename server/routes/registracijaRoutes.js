const express = require("express");
const router = express.Router();
const registracijaController = require("../controllers/registracijaController");

router.post("/", registracijaController.register);

module.exports = router;
