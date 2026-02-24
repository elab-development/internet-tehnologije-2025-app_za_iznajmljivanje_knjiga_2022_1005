const express = require("express");
const cors = require("cors");
const { startCron } = require("./eksterni/email");
const { proveriISaljiPodsetnike } = require("./eksterni/email");
const publikacijaRoutes = require("./routes/publikacijaRoutes");
const loginRoutes = require("./routes/loginRoutes");
const korisniciRoutes = require("./routes/korisniciRoutes");
const auth = require("./middleware/authMiddleware");
const istrazi = require("./eksterni/istrazi");
const citati = require("./eksterni/citati");
const helmet = require('helmet'); 
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const nodemailer = require("nodemailer");
const { Zaduzenje, Publikacija, Korisnik } = require("./models");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // vukbojanic000@gmail.com
    pass: process.env.EMAIL_PASS, //s
  },
});

const app = express();
const lokalniKes = {};

app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/login", require("./routes/loginRoutes"));
app.use("/api/registracija", require("./routes/registracijaRoutes"));
app.use("/api/korisnici", korisniciRoutes);
app.use("/api/eksterni", istrazi);
app.use("/api/citati", citati);
app.use('/api/publikacije', publikacijaRoutes);
const db = require("./models");

app.post("/api/kontakt", async (req, res) => {
  const { ime, email, poruka } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Kontakt forma: Poruka  stigla od ${ime}`,
    text: `Dobili ste novu poruku sa kontakt forme:\n\nIme: ${ime}\nEmail: ${email}\n\nPoruka:\n${poruka}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Greška pri slanju mejla" });
    }
    res.json({ message: "Poruka je uspešno poslata biblioteci!" });
  });
});

app.get("/api/me", auth, async (req, res) => {
  try {
    const { id, uloga } = req.user;
    if (uloga === "student") {
      const student = await db.Student.findByPk(id, {
        attributes: ["id", "ime", "prezime", "email", "brojIndeksa"],
      });
      if (!student)
        return res.status(404).json({ message: "Korisnik nije pronađen" });
      return res.json({
        id: student.id,
        ime: student.ime,
        prezime: student.prezime,
        email: student.email,
        uloga: "student",
        isAdmin: false,
        brojIndeksa: student.brojIndeksa ?? null,
      });
    }
    if (uloga === "sluzbenik") {
      const sluzbenik = await db.Sluzbeniks.findByPk(id, {
        attributes: ["id", "ime", "prezime", "email", "isAdmin"],
      });
      if (!sluzbenik)
        return res.status(404).json({ message: "Korisnik nije pronađen" });
      return res.json({
        id: sluzbenik.id,
        ime: sluzbenik.ime,
        prezime: sluzbenik.prezime,
        email: sluzbenik.email,
        uloga: "sluzbenik",
        isAdmin: !!sluzbenik.isAdmin,
        brojIndeksa: null,
      });
    }
    return res.status(400).json({ message: "Nepoznata uloga" });
  } catch (err) {
    res.status(500).json({ message: "Greška na serveru", error: err.message });
  }
});


app.get("/api/moje-knjige", auth, async (req, res) => {
  try {
    const zaduzenja = await db.Zaduzenje.findAll({
      where: { studentId: req.user.id },
      include: [{ model: db.Publikacija, as: "publikacija", attributes: ["naziv", "autor"] }]
    });
    const rezultati = zaduzenja.map((z) => {
      const datumUzimanja = new Date(z.vreme_zaduzivanja || z.datumZaduzenja || Date.now());
      const izracunatRok = new Date(datumUzimanja);
      izracunatRok.setDate(izracunatRok.getDate() + 30);
      return { id: z.id, naziv: z.publikacija?.naziv || "Nepoznato", autor: z.publikacija?.autor || "Nepoznato", rok: izracunatRok.toLocaleDateString("sr-RS"), status: z.status || "Aktivno" };
    });
    res.json(rezultati);
  } catch (error) { res.status(500).json({ message: "Greška na serveru", error: error.message }); }
});



app.post("/api/zaduzi-knjigu", async (req, res) => {
  try {
    const { publikacijaId, brojIndeksa } = req.body;

    const student = await db.Student.findOne({
      where: { brojIndeksa: brojIndeksa },
    });

    if (!student) {
      return res
        .status(404)
        .json({ message: `Student sa indeksom ${brojIndeksa} nije pronađen!` });
    }

    const brojAktivnih = await db.Zaduzenje.count({
      where: {
        studentId: student.id,
        status: "Aktivno",
      },
    });

    if (brojAktivnih >= 6) {
      return res.status(400).json({
        message: `Zaduživanje nije moguće. Student ${student.ime} već ima 6 aktivna zaduženja!`,
      });
    }
    const knjiga = await db.Publikacija.findByPk(publikacijaId);
    if (!knjiga || knjiga.stanje <= 0) return res.status(400).json({ message: "Knjiga trenutno nije na stanju." });
    await db.Zaduzenje.create({ studentId: student.id, publikacijaId, datumZaduzenja: new Date(), status: "Aktivno" });
    await knjiga.decrement("stanje", { by: 1 });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "Potvrda o zaduživanju knjige",
      text: `Zdravo ${student.ime}, uspešno ste zadužili knjigu "${knjiga.naziv}". Rok za vraćanje je ${rok.toLocaleDateString("sr-RS")}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Greška pri slanju mejla:", error);
      else console.log("Email poslat studentu: " + info.response);
    });

    res.json({ message: `Uspešno zaduženo studentu ${student.ime}!` });
  } catch (error) {
    console.error("GREŠKA :", error);
    res
      .status(500)
      .json({ message: "Greška pri upisu u bazu", error: error.message });
  }
});

app.put("/api/razduzi/:id", auth, async (req, res) => {
  try {
    const zaduzenje = await db.Zaduzenje.findByPk(req.params.id);
    if (!zaduzenje) return res.status(404).json({ message: "Zaduženje nije nađeno" });
    zaduzenje.status = "Vraćeno";
    await zaduzenje.save();
    const knjiga = await db.Publikacija.findByPk(zaduzenje.publikacijaId);
    if (knjiga) await knjiga.increment("stanje", { by: 1 });
    res.json({ message: "Knjiga uspešno vraćena!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
});

app.get("/api/admin/sluzbenici", auth, async (req, res) => {
  try {
    const sluzbenici = await db.Sluzbeniks.findAll({
      where: { isAdmin: false },
    });

    res.json(Array.isArray(sluzbenici) ? sluzbenici : []);
  } catch (error) {
    console.error("GRESKA ADMIN SLUZBENICI:", error);
    res.status(500).json([]);
  }
});

app.get("/api/admin/studenti", auth, async (req, res) => {
  try {
    let model = db.Student || db.Students || db.student || db.students;

    if (!model) {
      return res
        .status(500)
        .json({ error: "Model nije definisan", dostupni: Object.keys(db) });
    }

    const studenti = await model.findAll();
    res.json(studenti);
  } catch (error) {
    console.error("greska:", error);
    res.status(500).json([]);
  }
});

app.delete("/api/admin/brisi/:tip/:id", auth, async (req, res) => {
  try {
    const { tip, id } = req.params;
    if (tip === "student") {
      await db.Student.destroy({ where: { id } });
    } else {
      await db.Sluzbenik.destroy({ where: { id } });
    }
    res.json({ message: "Nalog obrisan" });
  } catch (error) {
    console.error("greskaa:", error);
    res
      .status(500)
      .json({ message: "greskaa pri brisanju", detalji: error.message });
  }
});
app.get("/api/zaduzenja/aktivna", auth, async (req, res) => {
  const aktivna = await db.Zaduzenje.findAll({
    where: { status: "Aktivno" },
    include: [
      { model: db.Publikacija },
      {
        model: db.Student,
        as: "student",
        attributes: ["id", "ime", "prezime", "brojIndeksa"],
      },
    ],
  });
  res.json(aktivna);
});

app.get("/api/debug-rok", async (req, res) => {
  try {
    console.log("--- RUČNO POKRETANJE PROVERE ROKOVA ---");
    await proveriISaljiPodsetnike();
    res.json({
      message: "Provera pokrenuta! Proveri terminal u Dockeru i svoj inbox.",
      savet:
        "Ako mejl nije stigao, proveri da li u bazi imaš zaduženje sa datumom: 17.02.2026.",
    });
  } catch (err) {
    console.error("Greška pri ručnom testu:", err);
    res.status(500).json({ message: "Greška!", error: err.message });
  }
});
app.get("/zaduzenja/istorija/:studentId", async (req, res) => {
  try {
    const istorija = await Zaduzenje.findAll({
      where: {
        studentId: req.params.studentId,
        status: "Vraćeno",
      },
      include: ["Publikacija"],
    });
    res.json(istorija);
  } catch (err) {
    res.status(500).json({ message: "Greška pri učitavanju istorije." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
  startCron();
});
