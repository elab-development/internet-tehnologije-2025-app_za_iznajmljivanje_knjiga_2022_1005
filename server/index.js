const express = require('express');
const cors = require('cors');
const publikacijaRoutes = require('./routes/publikacijaRoutes');
const loginRoutes = require('./routes/loginRoutes');
const korisniciRoutes = require('./routes/korisniciRoutes');
const auth = require('./middleware/authMiddleware');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/zaduzenja', require('./routes/zaduzenjaRoutes'));
app.use('/api/publikacije', publikacijaRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/korisnici', korisniciRoutes);
const db = require('./models'); 

app.get('/api/moje-knjige', auth, async (req, res) => {
  try {
    const korisnikId = req.user.id;

    const zaduzenja = await db.Zaduzenje.findAll({
      where: { studentId: korisnikId },
      include: [{
        model: db.Publikacija,
        as: 'publikacija', 
        attributes: ['naziv', 'autor']
      }]
    });

   
const rezultati = zaduzenja.map(z => {
   
    const datumUzimanja = new Date(z.vreme_zaduzivanja || z.datumZaduzenja || Date.now());
    

    const izracunatRok = new Date(datumUzimanja);
    izracunatRok.setDate(izracunatRok.getDate() + 30);

    return {
        id: z.rbKnjiga || z.id,
        naziv: z.publikacija ? z.publikacija.naziv : "Nepoznato",
        autor: z.publikacija ? z.publikacija.autor : "Nepoznato",
       
        rok: izracunatRok.toLocaleDateString('sr-RS'), 
        rawRok: izracunatRok.toISOString(),
        status: z.status || 'Aktivno' 
    };
});

    res.json(rezultati);
  } catch (error) {
    console.error("Greška na backendu:", error);
    res.status(500).json({ message: "Greška na serveru", error: error.message });
  }
});

app.post('/api/zaduzi-knjigu', async (req, res) => {
  try {
    const { publikacijaId, brojIndeksa } = req.body;

    const student = await db.Student.findOne({ 
      where: { brojIndeksa: brojIndeksa } 
    });

    if (!student) {
      return res.status(404).json({ message: `Student sa indeksom ${brojIndeksa} nije pronađen!` });
    }

    const knjiga = await db.Publikacija.findByPk(publikacijaId);
    if (!knjiga || knjiga.stanje <= 0) {
      return res.status(400).json({ message: "Knjiga trenutno nije na stanju." });
    }

   
    const danas = new Date();
    const rok = new Date();
    rok.setDate(danas.getDate() + 30); 

    await db.Zaduzenje.create({
      studentId: student.id,
      publikacijaId: publikacijaId,
      datumZaduzenja: danas,
      datumVracanja: rok, 
      status: 'Aktivno'
    });

    await knjiga.decrement('stanje', { by: 1 });

    res.json({ message: `Uspešno zaduženo studentu ${student.ime}!` });

  } catch (error) {
    console.error("GREŠKA :", error);
    res.status(500).json({ message: " greška pri upisu u bazu", error: error.message });
  }
});

app.put('/api/razduzi/:id', auth, async (req, res) => {
    try {
        const zaduzenje = await db.Zaduzenje.findByPk(req.params.id);
        if (!zaduzenje) return res.status(404).json({ message: "Zaduženje nije nađeno" });

        zaduzenje.status = 'Vraćeno';
        await zaduzenje.save();

        const knjiga = await db.Publikacija.findByPk(zaduzenje.publikacijaId);
        await knjiga.increment('stanje', { by: 1 });

        res.json({ message: "Knjiga uspešno vraćena!" });
    } catch (error) {
        res.status(500).json({ message: "Greška na serveru" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});