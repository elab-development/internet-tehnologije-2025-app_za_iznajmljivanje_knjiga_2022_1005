const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization']; 

  if (!token) {
    return res.status(403).json({ message: "Pristup odbijen. Token nedostaje." });
  }

  try {
   
    const cistiToken = token.split(' ')[1] || token;
    const dekodiran = jwt.verify(cistiToken, 'tajna_sifra_123');
    req.user = dekodiran; 
    next(); 
  } catch (err) {
    res.status(401).json({ message: "Nevalidan token." });
  }
};