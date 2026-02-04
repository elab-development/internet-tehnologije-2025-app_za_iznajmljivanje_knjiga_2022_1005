const { Zaduzenje, Publikacija } = require('../models');

exports.getZaduzenjaByStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const zaduzenja = await Zaduzenje.findAll({
      where: { studentId: id },
      include: [{ 
        model: Publikacija, 
        attributes: ['naziv'] 
      }]
    });
    

    res.json(zaduzenja); 
  } catch (error) {
  
    res.status(500).json({ error: error.message });
  }
};