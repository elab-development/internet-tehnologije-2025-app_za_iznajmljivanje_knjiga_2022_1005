"use strict";
const db = require("../models");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { ime, prezime, brojIndeksa, email, password } = req.body;

    if (!ime || !prezime || !brojIndeksa || !email || !password) {
      return res.status(400).json({ message: "Sva polja su obavezna." });
    }

    const postojiEmail = await db.Student.findOne({ where: { email } });
    if (postojiEmail) {
      return res.status(409).json({ message: "Email je već registrovan." });
    }

    const postojiIndeks = await db.Student.findOne({ where: { brojIndeksa } });
    if (postojiIndeks) {
      return res
        .status(409)
        .json({ message: "Broj indeksa je već u upotrebi." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const novi = await db.Student.create({
      ime,
      prezime,
      brojIndeksa,
      email,
      password: hashed,
    });

    return res.status(201).json({
      message: "Uspešna registracija.",
      student: {
        id: novi.id,
        ime: novi.ime,
        prezime: novi.prezime,
        email: novi.email,
      },
    });
  } catch (error) {
    console.error("Registracija error:", error);
    return res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};
