const { Publikacija, Kategorija } = require('../models');


exports.getAll = async (req, res) => {
  try {
    const { kategorijaId } = req.query;
    const uslov = kategorijaId ? { kategorijaId } : {};

    const publikacije = await Publikacija.findAll({
      where: uslov,
      include: [{ model: Kategorija, as: 'kategorija', attributes: ['naziv'] }]
    });
    return res.json(publikacije);
  } catch (error) {
    console.error('GET publikacije:', error);
    return res.status(500).json({ message: 'Greška pri dobavljanju podataka' });
  }
};
