const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://zenquotes.io/api/quotes');
        const prvihPet = response.data.slice(0, 5);

        const rezultati = await Promise.all(prvihPet.map(async (c) => {
            try {
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=sr-Latn&dt=t&q=${encodeURI(c.q)}`;
                const transRes = await axios.get(url);
                const prevedenTekst = transRes.data[0][0][0];

                return {
                    tekst: prevedenTekst,
                    autor: c.a
                };
            } catch (e) {
         
                return { tekst: c.q, autor: c.a };
            }
        }));

        res.json(rezultati);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;