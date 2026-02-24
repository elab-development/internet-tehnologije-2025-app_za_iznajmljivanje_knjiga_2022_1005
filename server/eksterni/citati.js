const express = require('express');
const router = express.Router();
const axios = require('axios');


// server/eksterni/citati.js
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://zenquotes.io/api/quotes'); // Povlači 50 citata
        
        // Uzmi samo prvih 5 da ne preopteretimo stranicu
        const prvihPet = response.data.slice(0, 5);

        // Mapiraj ih u tvoj format (tekst i autor)
        const rezultati = prvihPet.map(c => ({
            tekst: c.q,
            autor: c.a
        }));

        res.json(rezultati); // ŠALJEMO NIZ (LISTU)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;