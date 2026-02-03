const db = require('../models');


exports.getAll = async (req, res) => {
  try {
    if (req.user.uloga !== 'sluzbenik') {
      return res.status(403).json({ message: 'Samo službenik može da vidi listu korisnika.' });
    }

    const [studenti, sluzbenici] = await Promise.all([
      db.Student.findAll({ where: { aktiviran: true }, attributes: ['id', 'ime', 'prezime', 'email'] }),
      db.Sluzbenik.findAll({ where: { aktiviran: true }, attributes: ['id', 'ime', 'prezime', 'email', 'isAdmin'] })
    ]);

    const korisnici = [
      ...studenti.map(s => ({
        id: `student-${s.id}`,
        ime: s.ime,
        prezime: s.prezime,
        email: s.email,
        isAdmin: false
      })),
      ...sluzbenici.map(s => ({
        id: `sluzbenik-${s.id}`,
        ime: s.ime,
        prezime: s.prezime,
        email: s.email,
        isAdmin: !!s.isAdmin
      }))
    ];

    res.json(korisnici);
  } catch (error) {
    console.error('GET korisnici:', error);
    res.status(500).json({ message: 'Greška pri dobavljanju korisnika.' });
  }
};


exports.deaktiviraj = async (req, res) => {
  try {
    if (req.user.uloga !== 'sluzbenik') {
      return res.status(403).json({ message: 'Samo službenik može da deaktivira korisnike.' });
    }

    const compositeId = req.params.id;
    const match = compositeId.match(/^(student|sluzbenik)-(\d+)$/);
    if (!match) {
      return res.status(400).json({ message: 'Neispravan ID korisnika (očekuje se npr. student-5 ili sluzbenik-2).' });
    }

    const [, tip, rawId] = match;
    const id = parseInt(rawId, 10);

    if (tip === 'student') {
      const student = await db.Student.findByPk(id);
      if (!student) return res.status(404).json({ message: 'Student nije pronađen.' });
      await student.update({ aktiviran: false });
    } else {
      const sluzbenik = await db.Sluzbenik.findByPk(id);
      if (!sluzbenik) return res.status(404).json({ message: 'Službenik nije pronađen.' });
      await sluzbenik.update({ aktiviran: false });
    }

    res.json({ message: 'Korisnik je deaktiviran.' });
  } catch (error) {
    console.error(' deaktiviraj:', error);
    res.status(500).json({ message: 'Greška pri deaktivaciji.' });
  }
};
