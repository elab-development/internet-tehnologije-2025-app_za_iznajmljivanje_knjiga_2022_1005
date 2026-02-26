"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DodajPublikaciju() {
  const [naziv, setNaziv] = useState("");
  const [zadnjiTrazeniNaslov, setZadnjiTrazeniNaslov] = useState("");
  const [autor, setAutor] = useState("");
  const [kolicina, setKolicina] = useState(1);
  
  // 1. DODATO: isbn u state da bismo ga sačuvali iz API-ja
  const [preview, setPreview] = useState<{ slika: string | null; opis: string; isbn: string }>({
    slika: null,
    opis: "",
    isbn: "", 
  });
  
  const [ucitava, setUcitava] = useState(false);
  const router = useRouter();

  const povuciPreview = async () => {
    if (naziv === zadnjiTrazeniNaslov || naziv.length < 3) return;

    setUcitava(true);
    try {
      const res = await fetch(`http://localhost:5000/api/proveri-knjigu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naziv, autor }),
      });
      
      const data = await res.json();
      
      // 2. Ovde sada stiže i data.isbn jer smo ga dodali u backend funkciju
      setPreview(data);
      setZadnjiTrazeniNaslov(naziv); 

      if (data.autor && !autor) {
        setAutor(data.autor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUcitava(false);
    }
  };

const spasiUPublikacije = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const res = await fetch(`http://localhost:5000/api/publikacije`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      naziv,
      autor,
      stanje: kolicina,
      slika_url: preview.slika,
      isbn: preview.isbn
    }),
  });

  if (res.ok) {
    alert("Knjiga je dodata!");
    router.push("/katalog");
  }
};

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Dodaj Novu Publikaciju</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={spasiUPublikacije} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Naziv Knjige</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-black" // Dodao sam klase radi preglednosti
              value={naziv}
              onChange={(e) => setNaziv(e.target.value)} 
              onBlur={povuciPreview} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Autor</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-black"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              onBlur={povuciPreview}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dostupna Količina</label>
            <input
              type="number"
              className="w-full p-2 border rounded text-black"
              value={kolicina}
              onChange={(e) => setKolicina(Number(e.target.value))}
            />
          </div>

          {/* 4. Mala vizuelna potvrda za ISBN (opciono) */}
          {preview.isbn && (
            <p className="text-xs text-green-600">Pronađen ISBN: {preview.isbn}</p>
          )}

          <button 
            type="submit" 
            disabled={ucitava}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {ucitava ? "Učitavanje..." : "Sačuvaj u Katalog"}
          </button>
        </form>

        <div className="border-l pl-8 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-4 italic">Automatski pretpregled:</p>
          {ucitava ? (
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          ) : preview.slika ? (
            <div className="text-center">
              <img src={preview.slika} alt="Cover" className="h-64 shadow-lg mb-4 rounded mx-auto" />
              <p className="text-xs text-gray-600 line-clamp-3 px-4">{preview.opis}</p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📖</div>
              <p>Unesite naziv da vidite sliku</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}