const db = require('../models'); 
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

  
    const StudentModel = db.Student; 
    const SluzbenikModel = db.Sluzbeniks;

 
    if (!StudentModel || !SluzbenikModel) {
        return res.status(500).json({ 
            message: "Modeli nisu učitani!", 
            dostupni_modeli: Object.keys(db) 
        });
    }

   
    let korisnik = null;
    let uloga = '';

   
    korisnik = await StudentModel.findOne({ where: { email: email } });
    
    if (korisnik) {
        uloga = 'student';
    } else {
        
        korisnik = await SluzbenikModel.findOne({ where: { email: email } });
        if (korisnik) uloga = 'sluzbenik';
    }


    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    if (korisnik.aktiviran === false) {
      return res.status(403).json({ message: "Nalog je deaktiviran. Obratite se administratoru." });
    }

   
    if (password !== korisnik.password) {
      return res.status(401).json({ message: "Pogrešna lozinka" });
    }

    const token = jwt.sign(
      { id: korisnik.id, uloga: uloga, isAdmin: uloga === 'sluzbenik' ? !!korisnik.isAdmin : false },
      'itehhh',
      { expiresIn: '1d' }
    );

   
res.json({
  message: "Uspešan login!",
  token,
  korisnik: {
    id: korisnik.id,
    ime: korisnik.ime,
    prezime: korisnik.prezime,
    email: korisnik.email,
    uloga: uloga,
    isAdmin: uloga === 'sluzbenik' ? !!korisnik.isAdmin : false
  }
});

  } catch (error) {
    res.status(500).json({ message: "Greška na serveru", error: error.message });
  }
};