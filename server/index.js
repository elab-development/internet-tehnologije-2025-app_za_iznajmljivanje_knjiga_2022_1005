require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Dodato jer se koristi u proveri knjige
const nodemailer = require("nodemailer");
const helmet = require('helmet'); 
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const db = require("./models");

// Middleware i rute
const auth = require("./middleware/authMiddleware");
const publikacijaRoutes = require("./routes/publikacijaRoutes");
const korisniciRoutes = require("./routes/korisniciRoutes");
const istrazi = require("./eksterni/istrazi");
const citati = require("./eksterni/citati");
const { startCron, proveriISaljiPodsetnike } = require("./eksterni/email");

const app = express();

// Konfiguracija transportera
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware setup
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    'https://internet-tehnologije-2025-appzaiznajmljivanje-production-e347.up.railway.app',
    'http://localhost:3000' 
  ],
  credentials: true
}));

// Swagger i rute iz eksternih fajlova
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/login", require("./routes/loginRoutes"));
app.use("/api/registracija", require("./routes/registracijaRoutes"));
app.use("/api/korisnici", korisniciRoutes);
app.use("/api/eksterni", istrazi);
app.use("/api/citati", citati);
app.use('/api/publikacije', publikacijaRoutes);

// --- KONTAKT FORMA ---
app.post("/api/kontakt", async (req, res) => {
  const { ime, email, poruka } = req.body;
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Kontakt forma: Poruka stigla od ${ime}`,
    text: `Dobili ste novu poruku sa kontakt forme:\n\nIme: ${ime}\nEmail: ${email}\n\nPoruka:\n${poruka}`,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) return res.status(500).json({ message: "Greška pri slanju mejla" });
    res.json({ message: "Poruka je uspešno poslata biblioteci!" });
  });
});

// --- PROFIL KORISNIKA ---
app.get("/api/me", auth, async (req, res) => {
  try {
    const { id, uloga } = req.user;
    if (uloga === "student") {
      const student = await db.Student.findByPk(id, {
        attributes: ["id", "ime", "prezime", "email", "brojIndeksa"],
      });
      if (!student) return res.status(404).json({ message: "Korisnik nije pronađen" });
      return res.json({ ...student.get(), uloga: "student", isAdmin: false });
    }
    if (uloga === "sluzbenik") {
      const sluzbenik = await db.Sluzbeniks.findByPk(id, {
        attributes: ["id", "ime", "prezime", "email", "isAdmin"],
      });
      if (!sluzbenik) return res.status(404).json({ message: "Korisnik nije pronađen" });
      return res.json({ ...sluzbenik.get(), uloga: "sluzbenik", isAdmin: !!sluzbenik.isAdmin });
    }
    res.status(400).json({ message: "Nepoznata uloga" });
  } catch (err) {
    res.status(500).json({ message: "Greška na serveru", error: err.message });
  }
});
app.get("/api/zaduzenja/student/:studentId", async (req, res) => {
  try {
    const zaduzenja = await db.Zaduzenje.findAll({
      where: { 
        studentId: req.params.studentId, 
        status: "Aktivno" 
      },
      include: [{ model: db.Publikacija, as: "publikacija", attributes: ["naziv", "autor"] }]
    });
    
    const rezultati = zaduzenja.map((z) => {
      const datumUzimanja = new Date(z.datumZaduzenja || Date.now());
      const izracunatRok = new Date(datumUzimanja);
      izracunatRok.setDate(izracunatRok.getDate() + 30);
      return { 
        id: z.id, 
        naziv: z.publikacija?.naziv || "Nepoznato", 
        autor: z.publikacija?.autor || "Nepoznato", 
        rok: izracunatRok.toLocaleDateString("sr-RS"), 
        status: z.status || "Aktivno"
      };
    });
    res.json(rezultati);
  } catch (error) { 
    res.status(500).json([]); // Vraćamo prazan niz da .filter() na frontendu ne pukne
  }
});
app.get("/api/zaduzenja/istorija/:studentId", async (req, res) => {
  try {
    const istorija = await db.Zaduzenje.findAll({
      where: {
        studentId: req.params.studentId,
        status: "Vraćeno",
      },
      include: [{ model: db.Publikacija, as: "publikacija", attributes: ["naziv", "autor"] }],
    });
    res.json(istorija);
  } catch (err) {
    res.status(500).json([]); // Vraćamo prazan niz u slučaju greške
  }
});
// --- ZADUŽI KNJIGU ---
app.post("/api/zaduzi-knjigu", async (req, res) => {
  try {
    const { publikacijaId, brojIndeksa } = req.body;
    const student = await db.Student.findOne({ where: { brojIndeksa } });

    if (!student) return res.status(404).json({ message: `Student sa indeksom ${brojIndeksa} nije pronađen!` });

    const brojAktivnih = await db.Zaduzenje.count({ where: { studentId: student.id, status: "Aktivno" } });
    if (brojAktivnih >= 6) return res.status(400).json({ message: "Student već ima 6 aktivnih zaduženja!" });

    const knjiga = await db.Publikacija.findByPk(publikacijaId);
    if (!knjiga || knjiga.stanje <= 0) return res.status(400).json({ message: "Knjiga nije na stanju." });

    const rok = new Date();
    rok.setDate(rok.getDate() + 14);

    await db.Zaduzenje.create({ 
      studentId: student.id, 
      publikacijaId, 
      datumZaduzenja: new Date(), 
      status: "Aktivno" 
    });
    await knjiga.decrement("stanje", { by: 1 });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "Potvrda o zaduživanju",
      text: `Zdravo ${student.ime}, uspešno ste zadužili "${knjiga.naziv}". Rok: ${rok.toLocaleDateString("sr-RS")}.`,
    };
    transporter.sendMail(mailOptions, (err) => err && console.error("Mejl greška:", err));

    res.json({ message: `Uspešno zaduženo studentu ${student.ime}!` });
  } catch (error) {
    res.status(500).json({ message: "Greška pri upisu u bazu", error: error.message });
  }
});

// --- RAZDUŽI KNJIGU ---
app.put("/api/razduzi/:id", auth, async (req, res) => {
  try {
    const zaduzenje = await db.Zaduzenje.findByPk(req.params.id);
    if (!zaduzenje) return res.status(404).json({ message: "Zaduženje nije nađeno" });
    
    zaduzenje.status = "Vraćeno";
    zaduzenje.datumVracanja = new Date();
    await zaduzenje.save();

    const knjiga = await db.Publikacija.findByPk(zaduzenje.publikacijaId);
    if (knjiga) await knjiga.increment("stanje", { by: 1 });
    
    res.json({ message: "Knjiga uspešno vraćena!" });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru", error: error.message });
  }
});

// --- ADMIN RUTE ---
app.get("/api/admin/sluzbenici", auth, async (req, res) => {
  try {
    const sluzbenici = await db.Sluzbeniks.findAll({ where: { isAdmin: false } });
    res.json(sluzbenici);
  } catch (error) { res.status(500).json([]); }
});

app.get("/api/admin/studenti", auth, async (req, res) => {
  try {
    const studenti = await db.Student.findAll();
    res.json(studenti);
  } catch (error) { res.status(500).json([]); }
});

app.get("/api/zaduzenja/aktivna", auth, async (req, res) => {
  try {
    const aktivna = await db.Zaduzenje.findAll({
      where: { status: "Aktivno" },
      include: [
        { model: db.Publikacija, as: "publikacija" },
        { model: db.Student, as: "student", attributes: ["ime", "prezime", "brojIndeksa"] }
      ],
    });
    res.json(aktivna);
  } catch (err) { res.status(500).json([]); }
});

// --- START SERVERA ---
const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Server radi na portu ${PORT}`);
  startCron();
});