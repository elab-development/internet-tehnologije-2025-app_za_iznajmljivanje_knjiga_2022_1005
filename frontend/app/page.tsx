"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dugme } from "../components/Dugme";

export default function PregledPage() {
  const [publikacije, setPublikacije] = useState<any[]>([]);
  const [korisnik, setKorisnik] = useState<any>(null);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [pretraga, setPretraga] = useState("");
  const router = useRouter();

  useEffect(() => {
    const sacuvanKorisnik = localStorage.getItem('korisnik');
    if (sacuvanKorisnik) {
      setKorisnik(JSON.parse(sacuvanKorisnik));
    }

    const fetchPublikacije = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/publikacije');
        const data = await res.json();
        setPublikacije(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Greška pri učitavanju:", err);
        setPublikacije([]);
      } finally {
        setUcitavanje(false);
      }
    };

    fetchPublikacije();
  }, []);

  const handleZaduzivanje = async (id: number) => {
    const indeks = prompt("Unesite broj indeksa studenta (npr. 2022/1005):");
    if (!indeks) return;

    try {
      const res = await fetch('http://localhost:5000/api/zaduzi-knjigu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publikacijaId: id, brojIndeksa: indeks })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) window.location.reload();
    } catch (err) {
      alert("Greška pri povezivanju sa serverom.");
    }
  };

  const obrisiPublikaciju = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovu publikaciju?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/publikacije/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPublikacije(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      alert("Greška pri brisanju.");
    }
  };

  const jeAdmin = korisnik?.isAdmin === 1 || korisnik?.tip === 'sluzbenik';

  const filtriranePublikacije = publikacije.filter(p => 
    p.naziv?.toLowerCase().includes(pretraga.toLowerCase()) || 
    p.autor?.toLowerCase().includes(pretraga.toLowerCase())
  );

  if (ucitavanje) return <div className="p-10 text-center font-bold text-blue-900">Učitavanje kataloga...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-white">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Katalog Biblioteke</h1>
          <p className="text-gray-500 mt-1">
            Prijavljeni ste kao: <span className="font-bold text-blue-600">{korisnik?.ime || "Gost"}</span> 
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {jeAdmin ? 'ZAPOSLENI' : 'STUDENT'}
            </span>
          </p>
        </div>
        
        {jeAdmin && (
          <Dugme naslov="+ Nova Publikacija" boja="zelena" klik={() => router.push('/dodaj-publikaciju')} />
        )}
      </div>

      <div className="mb-10">
        <input 
          type="text"
          placeholder="Pretraži naslov ili autora..."
          className="w-full p-4 border-2 border-blue-50 rounded-xl shadow-sm focus:border-blue-500 focus:bg-blue-50/30 outline-none transition-all"
          onChange={(e) => setPretraga(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtriranePublikacije.map((p: any) => (
          <div key={p.id} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded">
                  {p.Kategorija?.naziv || "Publikacija"}
                </span>
                <h3 className="text-2xl font-bold text-gray-800 mt-2 leading-tight">{p.naziv}</h3>
                <p className="text-gray-500 italic mt-1 font-medium">Autor: {p.autor}</p>
              </div>
              <div className="ml-4">
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${p.stanje > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  Stanje: {p.stanje}
                </div>
              </div>
            </div>

            {!jeAdmin && p.ZaduzenaKodMene && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2">
                Rok za vraćanje: <span className="font-bold">15.02.2026.</span>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              {jeAdmin && (
                <>
                  <Dugme 
                    naslov="Zaduži" 
                    boja="plava" 
                    onemoguceno={p.stanje <= 0} 
                    klik={() => handleZaduzivanje(p.id)} 
                  />
                  <Dugme 
                    naslov="Izmeni" 
                    boja="siva" 
                    klik={() => router.push(`/izmeni-publikaciju/${p.id}`)}
                  />
                  <Dugme 
                    naslov="Obriši" 
                    boja="crvena" 
                    klik={() => obrisiPublikaciju(p.id)} 
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filtriranePublikacije.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">
          Nema rezultata za "{pretraga}"
        </div>
      )}
    </div>
  );
}