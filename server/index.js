const express = require("express");
const cors = require("cors");
const { startCron } = require('./eksterni/email');
const { proveriISaljiPodsetnike } = require("./eksterni/email");
const publikacijaRoutes = require("./routes/publikacijaRoutes");
const loginRoutes = require("./routes/loginRoutes");
const korisniciRoutes = require("./routes/korisniciRoutes");
const auth = require("./middleware/authMiddleware");
const istrazi = require('./eksterni/istrazi');
const express = require('express');
const helmet = require('helmet');


app.use(helmet());
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/zaduzenja", require("./routes/zaduzenjaRoutes"));
app.use("/api/publikacije", publikacijaRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/registracija", require("./routes/registracijaRoutes"));
app.use("/api/korisnici", korisniciRoutes);
app.use('/api/eksterni', istrazi);
const db = require("./models");

app.get("/api/me", auth, async (req, res) => {
  try {
    const { id, uloga, isAdmin } = req.user;
    if (uloga === "student") {
      const student = await db.Student.findByPk(id, { attributes: ["id", "ime", "prezime", "email", "brojIndeksa"] });
      if (!student) return res.status(404).json({ message: "Korisnik nije pronađen" });
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
      const sluzbenik = await db.Sluzbeniks.findByPk(id, { attributes: ["id", "ime", "prezime", "email", "isAdmin"] });
      if (!sluzbenik) return res.status(404).json({ message: "Korisnik nije pronađen" });
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
    const korisnikId = req.user.id;

    const zaduzenja = await db.Zaduzenje.findAll({
      where: { studentId: korisnikId },
      include: [
        {
          model: db.Publikacija,
          as: "publikacija",
          attributes: ["naziv", "autor"],
        },
      ],
    });

    const rezultati = zaduzenja.map((z) => {
      const datumUzimanja = new Date(
        z.vreme_zaduzivanja || z.datumZaduzenja || Date.now(),
      );

      const izracunatRok = new Date(datumUzimanja);
      izracunatRok.setDate(izracunatRok.getDate() + 30);

      return {
        id: z.rbKnjiga || z.id,
        naziv: z.publikacija ? z.publikacija.naziv : "Nepoznato",
        autor: z.publikacija ? z.publikacija.autor : "Nepoznato",

        rok: izracunatRok.toLocaleDateString("sr-RS"),
        rawRok: izracunatRok.toISOString(),
        status: z.status || "Aktivno",
      };
    });

    res.json(rezultati);
  } catch (error) {
    console.error("Greška na backendu:", error);
    res
      .status(500)
      .json({ message: "Greška na serveru", error: error.message });
  }
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

    const knjiga = await db.Publikacija.findByPk(publikacijaId);
    if (!knjiga || knjiga.stanje <= 0) {
      return res
        .status(400)
        .json({ message: "Knjiga trenutno nije na stanju." });
    }

    const danas = new Date();
    const rok = new Date();
    rok.setDate(danas.getDate() + 30);

    await db.Zaduzenje.create({
      studentId: student.id,
      publikacijaId: publikacijaId,
      datumZaduzenja: danas,
      datumVracanja: rok,
      status: "Aktivno",
    });

    await knjiga.decrement("stanje", { by: 1 });

    res.json({ message: `Uspešno zaduženo studentu ${student.ime}!` });
  } catch (error) {
    console.error("GREŠKA :", error);
    res
      .status(500)
      .json({ message: " greška pri upisu u bazu", error: error.message });
  }
});
app.post("/api/admin/kreiraj-sluzbenika", auth, async (req, res) => {
  try {
    

    const { ime, prezime, email, password } = req.body;

    const isAdmin = 0; 

    await db.Sluzbeniks.create({
      ime,
      prezime,
      email,
      password, 
      isAdmin: isAdmin
    });

    res.status(201).json({ message: "Službenik uspešno kreiran!" });
  } catch (err) {
    console.error("Greška pri kreiranju službenika:", err);
    res.status(500).json({ message: "Greška na serveru", error: err.message });
  }
});

app.put("/api/razduzi/:id", auth, async (req, res) => {
  try {
    const zaduzenje = await db.Zaduzenje.findByPk(req.params.id);
    if (!zaduzenje) {
      return res.status(404).json({ message: "Zaduženje nije nađeno" });
    }

    zaduzenje.status = "Vraćeno";
    await zaduzenje.save();

    const knjiga = await db.Publikacija.findByPk(zaduzenje.publikacijaId);
    if (knjiga) {
      await knjiga.increment("stanje", { by: 1 });
    }

    res.json({ message: "Knjiga uspešno vraćena!" });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru", error: error.message });
  }
}); 

app.get('/api/admin/sluzbenici', auth, async (req, res) => {
    try {
        const sluzbenici = await db.Sluzbeniks.findAll({ 
            where: { isAdmin: false } 
        });
       
        res.json(Array.isArray(sluzbenici) ? sluzbenici : []);
    } catch (error) {
        console.error("GRESKA ADMIN SLUZBENICI:", error);
        res.status(500).json([]); 
    }
});

app.get('/api/admin/studenti', auth, async (req, res) => {
 


    try {
    
        let model = db.Student || db.Students || db.student || db.students;

        if (!model) {
         
            return res.status(500).json({ error: "Model nije definisan", dostupni: Object.keys(db) });
        }

        const studenti = await model.findAll();
        res.json(studenti);
    } catch (error) {
        console.error("greska:", error);
        res.status(500).json([]);
    }
});
app.delete('/api/admin/brisi/:tip/:id', auth, async (req, res) => {
    try {
        const { tip, id } = req.params;
        if (tip === 'student') {
            await db.Student.destroy({ where: { id } });
        } else {
            await db.Sluzbenik.destroy({ where: { id } });
        }
        res.json({ message: "Nalog obrisan" });
    } catch (error) {
        console.error("greskaa:", error); 
        res.status(500).json({ message: "greskaa pri brisanju", detalji: error.message });
    }
});
app.get('/api/zaduzenja/aktivna', auth, async (req, res) => {
    const aktivna = await db.Zaduzenje.findAll({
      where: { status: 'Aktivno' },
      include: [
        { model: db.Publikacija },
        { model: db.Student, as: 'student', attributes: ['id', 'ime', 'prezime', 'brojIndeksa'] }
      ]
    });
    res.json(aktivna);
});

app.get("/api/debug-rok", async (req, res) => {
  try {
    console.log("--- RUČNO POKRETANJE PROVERE ROKOVA ---");
    await proveriISaljiPodsetnike();
    res.json({ 
        message: "Provera pokrenuta! Proveri terminal u Dockeru i svoj inbox.",
        savet: "Ako mejl nije stigao, proveri da li u bazi imaš zaduženje sa datumom: 17.02.2026." 
    });
  } catch (err) {
    console.error("Greška pri ručnom testu:", err);
    res.status(500).json({ message: "Greška!", error: err.message });
  }
});
app.get('/zaduzenja/istorija/:studentId', async (req, res) => {
    try {
        const istorija = await Zaduzenje.findAll({
            where: {
                studentId: req.params.studentId,
                status: 'Vraćeno' 
            },
            include: ['Publikacija'] 
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
