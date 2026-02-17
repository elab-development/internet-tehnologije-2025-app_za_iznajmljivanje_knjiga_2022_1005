const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const { startCron, proveriISaljiPodsetnike } = require('./eksterni/email');
const { dovuciDetalje } = require('./eksterni/detaljiOKnjizi');
const auth = require("./middleware/authMiddleware");
const db = require("./models");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const lokalniKes = {};

app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/login", require("./routes/loginRoutes"));
app.use("/api/registracija", require("./routes/registracijaRoutes"));
app.use("/api/publikacije", require("./routes/publikacijaRoutes"));
app.use("/api/korisnici", require("./routes/korisniciRoutes"));
app.use("/api/zaduzenja", require("./routes/zaduzenjaRoutes"));
app.use('/api/eksterni', require('./eksterni/istrazi'));


app.get("/api/me", auth, async (req, res) => {
  try {
    const { id, uloga } = req.user;
    if (uloga === "student") {
      const student = await db.Student.findByPk(id, { attributes: ["id", "ime", "prezime", "email", "brojIndeksa"] });
      if (!student) return res.status(404).json({ message: "Korisnik nije pronađen" });
      return res.json({ id: student.id, ime: student.ime, prezime: student.prezime, email: student.email, uloga: "student", isAdmin: false, brojIndeksa: student.brojIndeksa ?? null });
    }
    const sluzbenik = await db.Sluzbeniks.findByPk(id, { attributes: ["id", "ime", "prezime", "email", "isAdmin"] });
    if (!sluzbenik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    return res.json({ id: sluzbenik.id, ime: sluzbenik.ime, prezime: sluzbenik.prezime, email: sluzbenik.email, uloga: "sluzbenik", isAdmin: !!sluzbenik.isAdmin });
  } catch (err) { res.status(500).json({ message: "Greška na serveru", error: err.message }); }
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
    const student = await db.Student.findOne({ where: { brojIndeksa } });
    if (!student) return res.status(404).json({ message: `Student sa indeksom ${brojIndeksa} nije pronađen!` });
    const knjiga = await db.Publikacija.findByPk(publikacijaId);
    if (!knjiga || knjiga.stanje <= 0) return res.status(400).json({ message: "Knjiga trenutno nije na stanju." });
    await db.Zaduzenje.create({ studentId: student.id, publikacijaId, datumZaduzenja: new Date(), status: "Aktivno" });
    await knjiga.decrement("stanje", { by: 1 });
    res.json({ message: `Uspešno zaduženo studentu ${student.ime}!` });
  } catch (error) { res.status(500).json({ message: "Greška pri upisu", error: error.message }); }
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
  } catch (error) { res.status(500).json({ message: "Greška na serveru", error: error.message }); }
});


app.get('/api/admin/sluzbenici', auth, async (req, res) => {
    try {
        const sluzbenici = await db.Sluzbeniks.findAll({ where: { isAdmin: false } });
        res.json(Array.isArray(sluzbenici) ? sluzbenici : []);
    } catch (error) { res.status(500).json([]); }
});


app.get('/api/admin/studenti', auth, async (req, res) => {
    try {
        let model = db.Student || db.Students;
        const studenti = await model.findAll();
        res.json(studenti);
    } catch (error) { res.status(500).json([]); }
});


app.delete('/api/admin/brisi/:tip/:id', auth, async (req, res) => {
    try {
        const { tip, id } = req.params;
        if (tip === 'student') await db.Student.destroy({ where: { id } });
        else await db.Sluzbeniks.destroy({ where: { id } });
        res.json({ message: "Nalog obrisan" });
    } catch (error) { res.status(500).json({ message: "Greška pri brisanju" }); }
});


app.post("/api/admin/kreiraj-sluzbenika", auth, async (req, res) => {
  try {
    const { ime, prezime, email, password } = req.body;
    await db.Sluzbeniks.create({ ime, prezime, email, password, isAdmin: 0 });
    res.status(201).json({ message: "Službenik uspešno kreiran!" });
  } catch (err) { res.status(500).json({ message: "Greška na serveru" }); }
});


app.get('/api/zaduzenja/aktivna', auth, async (req, res) => {
    const aktivna = await db.Zaduzenje.findAll({
      where: { status: 'Aktivno' },
      include: [{ model: db.Publikacija }, { model: db.Student, as: 'student' }]
    });
    res.json(aktivna);
});


app.get('/zaduzenja/istorija/:studentId', async (req, res) => {
    try {
        const istorija = await db.Zaduzenje.findAll({
            where: { studentId: req.params.studentId, status: 'Vraćeno' },
            include: [{ model: db.Publikacija }]
        });
        res.json(istorija);
    } catch (err) { res.status(500).json([]); }
});


app.post('/api/proveri-knjigu', async (req, res) => {
    const podaci = await dovuciDetalje(req.body.naziv, req.body.autor);
    res.json(podaci);
});


app.get('/api/eksterni-detalji', async (req, res) => {
  try {
    const { naslov, autor } = req.query;
    const kljuc = `${naslov}-${autor || ''}`;
    if (lokalniKes[kljuc]) return res.json(lokalniKes[kljuc]);
    const rezultat = await dovuciDetalje(naslov, autor);
    lokalniKes[kljuc] = rezultat;
    res.json(rezultat);
  } catch (error) { res.json({ slika: null, opis: "Nedostupno", ocena: "Nema" }); }
});


app.get("/api/debug-rok", async (req, res) => {
  await proveriISaljiPodsetnike();
  res.json({ message: "Provera pokrenuta!" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
  startCron(); 
});