const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/istrazi/:pojam', async (req, res) => {
    const { pojam } = req.params;
    
    
    let formatiranPojam = pojam.trim().replace(/ /g, "_");
    formatiranPojam = formatiranPojam.charAt(0).toUpperCase() + formatiranPojam.slice(1);
    
    const url = `https://sr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatiranPojam)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                
                'User-Agent': 'LibraryAppProject/1.0 (student@example.com) Axios/1.6.0'
            }
        });
        
       
        return res.json({
            naslov: response.data.title,
            opis: response.data.extract,
            link: response.data.content_urls.desktop.page
        });

    } catch (error) {
        console.log("DEBUG INFO");
        console.log( error.response ? error.response.status : "Mrezna greska");
        
        
        if (!res.headersSent) {
            return res.status(404).json({ message: "Pojam nije pronađen na srpskoj Vikipediji." });
        }
    }
});

module.exports = router;