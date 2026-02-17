const axios = require('axios');

const dovuciDetalje = async (naslov, autor) => {
   
    const cistNaslov = naslov.split(/[,(\-]/)[0].trim().split(' ').slice(0, 3).join(' ');
    const cistAutor = autor ? autor.split(',')[0].trim() : '';

    try {
        
       const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cistNaslov)}&limit=1`;
        
        console.log("Šaljem upit na Open Library:", url);
        
        const response = await axios.get(url, { timeout: 5000 });
        const docs = response.data?.docs;

        if (docs && docs.length > 0) {
    const knjiga = docs[0];
    return {
        ocena: knjiga.ratings_average ? knjiga.ratings_average.toFixed(1) : "Nema ocene",
        slika: knjiga.cover_i ? `https://covers.openlibrary.org/b/id/${knjiga.cover_i}-L.jpg` : null,
        opis: knjiga.first_sentence ? knjiga.first_sentence[0] : "Opis preuzet sa OpenLibrary.",
   
        autor: knjiga.author_name ? knjiga.author_name[0] : "" 
    };
}
        
        return { slika: null, ocena: "Nema ocene", opis: "Nema opisa." };

    } catch (e) {
        console.error("Open Library Error:", e.message);
        return { slika: null, ocena: "Nema ocene", opis: "Nema opisa." };
    }
};

module.exports = { dovuciDetalje };