const db = require("../models");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const StudentModel = db.Student;
    const SluzbenikModel = db.Sluzbenik;

    if (!StudentModel || !SluzbenikModel) {
      return res.status(500).json({
        message: "Modeli nisu učitani!",
        dostupni_modeli: Object.keys(db),
      });
    }

    let korisnik = null;
    let uloga = "";

    korisnik = await StudentModel.findOne({ where: { email: email } });

    if (korisnik) {
      uloga = "student";
    } else {
      korisnik = await SluzbenikModel.findOne({ where: { email: email } });
      if (korisnik) {
        uloga = "sluzbenik";
      }
    }

    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    if (korisnik.aktiviran === false) {
      return res.status(403).json({ message: "Nalog je deaktiviran." });
    }

    if (password !== korisnik.password) {
      return res.status(401).json({ message: "Pogrešna lozinka" });
    }

    const isAdminStatus = uloga === "sluzbenik" && korisnik.isAdmin ? 1 : 0;

    const token = jwt.sign(
      {
        id: korisnik.id,
        uloga: uloga,
        isAdmin: isAdminStatus,
      },
      "tajna_sifra_123",
      { expiresIn: "1d" },
    );

    return res.json({
      message: "Uspešan login!",
      token,
      korisnik: {
        id: korisnik.id,
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        email: korisnik.email,
        uloga: uloga,
        isAdmin: isAdminStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
};
