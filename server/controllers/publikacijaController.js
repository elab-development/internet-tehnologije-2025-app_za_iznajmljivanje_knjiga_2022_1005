const { Publikacija } = require('../models');

// Funkcija 1: Lista svih
exports.getAll = async (req, res) => {
    try {
        const publikacije = await Publikacija.findAll();
        res.json(publikacije);
    } catch (e) {
        res.status(500).json({ message: "Greška" });
    }
};

// Funkcija 2: Dodavanje nove (OVO TI JE BITNO ZA DUGME)
exports.create = async (req, res) => {
    try {
        const { naziv, autor, stanje, slika_url, isbn } = req.body;
        const nova = await Publikacija.create({
            naziv,
            autor,
            stanje: stanje || 1,
            slika_url,
            isbn: isbn || "Nepoznato"
        });
        res.status(201).json(nova);
    } catch (e) {
        res.status(500).json({ message: "Greška pri upisu" });
    }
};

// Funkcija 3: Provera podataka (privremeno prazna da ne puca server)
exports.proveriKnjigu = async (req, res) => {
    res.json({ message: "Ruta radi, ali smo isključili eksterni API privremeno." });
};