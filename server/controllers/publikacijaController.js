const { Publikacija } = require('../models');


exports.getAll = async (req, res) => {
    try {
        const publikacije = await Publikacija.findAll();
        res.json(publikacije);
    } catch (e) {
        res.status(500).json({ message: "Greška" });
    }
};


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


exports.proveriKnjigu = async (req, res) => {
    res.json({ message: "Ruta radi, ali smo isključili eksterni API privremeno." });
};