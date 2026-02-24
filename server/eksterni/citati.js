const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://zenquotes.io/api/quotes');
        const prvihPet = response.data.slice(0, 5);

        // Mapiramo i prevodimo svaki citat
        const rezultati = await Promise.all(prvihPet.map(async (c) => {
            try {
                // Pozivamo Google-ov besplatni translate endpoint
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=sr&dt=t&q=${encodeURI(c.q)}`;
                const transRes = await axios.get(url);
                const prevedenTekst = transRes.data[0][0][0];

                return {
                    tekst: prevedenTekst,
                    autor: c.a
                };
            } catch (e) {
                // Ako prevod pukne, šaljemo original da ne bude prazno
                return { tekst: c.q, autor: c.a };
            }
        }));

        res.json(rezultati);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;