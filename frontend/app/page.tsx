"use client";

import { useState, useEffect,useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dugme } from "../components/Dugme";
import { Polje } from "../components/Polje";
import { API_BASE_URL } from "../lib/api";

interface Citat {
  tekst: string;
  autor: string;
}


const CitatDana = () => {
  const [citati, setCitati] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ucitaj = async () => {
      try {
        // 1. Prvo proveri da li već imamo citate u memoriji (LocalStorage)
        const sacuvaniCitati = localStorage.getItem("moji_citati");
        if (sacuvaniCitati) {
          const parsed = JSON.parse(sacuvaniCitati);
          if (parsed.length > 0) {
            setCitati(parsed);
            setLoading(false);
            return; // Prekidamo, nema potrebe da mučimo API
          }
        }

        // 2. Ako nemamo u memoriji, tek onda vuci sa servera
        const res = await fetch(`${API_BASE_URL}/api/citati`);
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
          setCitati(data);
          // 3. Sačuvaj ih u LocalStorage za sledeći put
          localStorage.setItem("moji_citati", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Greška API:", err);
      } finally {
        setLoading(false);
      }
    };
    ucitaj();
  }, []);

  const sledeci = useCallback(() => {
    if (citati.length === 0) return;
    setIndex((prev) => (prev + 1) % citati.length);
  }, [citati.length]);

  const prethodni = useCallback(() => {
    if (citati.length === 0) return;
    setIndex((prev) => (prev - 1 + citati.length) % citati.length);
  }, [citati.length]);

  // KLJUČNO: Ako nema podataka ili se učitava, ne crtaj ništa (neće biti praznih navodnika)
  if (loading || citati.length === 0 || !citati[index]?.tekst) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md border-2 border-svetlo-plava p-8 rounded-[2.5rem] shadow-xl my-12 group overflow-hidden">
      <button onClick={prethodni} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg text-mint hidden sm:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <button onClick={sledeci} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg text-mint hidden sm:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roze/10 text-[11px] font-black tracking-[0.25em] uppercase text-roze border border-roze/40">
          Citat dana
        </span>
      </div>

      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {citati.map((c, i) => (
          <div key={i} className="w-full flex-shrink-0 px-8 md:px-12 text-center">
            <p className="text-lg md:text-xl italic font-medium text-slate-800 leading-relaxed mb-3">
              "{c.tekst}"
            </p>
            <span className="text-roze font-semibold tracking-widest text-xs md:text-sm uppercase">— {c.autor}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-8">
        {citati.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-8 bg-mint" : "w-2.5 bg-svetlo-plava/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
export default function KatalogPage() {
  const [publikacije, setPublikacije] = useState<any[]>([]);
  const [korisnik, setKorisnik] = useState<any>(null);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [pretraga, setPretraga] = useState("");
  const router = useRouter();
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [selektovanaPublikacijaId, setSelektovanaPublikacijaId] = useState<number | null>(null);
  const [indeks, setIndeks] = useState("");
  const [feedback, setFeedback] = useState<{ poruka: string; uspeh: boolean; } | null>(null);
  const [mrdni, setMrdni] = useState(false);

  useEffect(() => {
    const sacuvanKorisnik = localStorage.getItem("korisnik");
    if (sacuvanKorisnik) setKorisnik(JSON.parse(sacuvanKorisnik));

    osveziPodatke();
  }, []);

  const osveziPodatke = () => {
    fetch(`${API_BASE_URL}/api/publikacije`)
      .then((res) => res.json())
      .then((data) => {
        setPublikacije(Array.isArray(data) ? data : []);
        setUcitavanje(false);
      })
      .catch(() => setUcitavanje(false));
  };

  const isAdmin = Number(korisnik?.isAdmin) === 1;
  const jeSluzbenik = korisnik?.uloga === "sluzbenik" && !isAdmin;

  const obrisiPublikaciju = async (id: number) => {
    if (!confirm("Obrisati?")) return;
    const res = await fetch(`${API_BASE_URL}/api/publikacije/${id}`, { method: "DELETE" });
    if (res.ok) setPublikacije((prev) => prev.filter((p) => p.id !== id));
  };

  const otvoriModal = (id: number) => {
    setSelektovanaPublikacijaId(id);
    setIndeks("");
    setFeedback(null);
    setModalOtvoren(true);
  };

  const izvrsiZaduzivanje = () => {
    if (!indeks || !selektovanaPublikacijaId) return;
    setMrdni(true);
    setTimeout(() => setMrdni(false), 200);

    fetch(`${API_BASE_URL}/api/zaduzi-knjigu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publikacijaId: selektovanaPublikacijaId,
        brojIndeksa: indeks,
      }),
    })
      .then(async (res) => {
        const isOk = res.ok;
        const data = await res.json();
        return { isOk, data };
      })
      .then(({ isOk, data }) => {
        setFeedback({ poruka: data.message, uspeh: isOk });
        if (isOk) osveziPodatke();
      })
      .catch(() => setFeedback({ poruka: "Greška na serveru", uspeh: false }));
  };

  const filtrirane = publikacije.filter(
    (p) =>
      p.naziv?.toLowerCase().includes(pretraga.toLowerCase()) ||
      p.autor?.toLowerCase().includes(pretraga.toLowerCase())
  );

  if (ucitavanje) return <div className="p-10 text-center font-bold text-tamno-plava">Učitavanje...</div>;

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-tamno-plava uppercase">Katalog</h1>
        {isAdmin && <Dugme naslov="+ Nova publikacija" boja="zelena" klik={() => router.push("/dodaj-publikaciju")} />}
      </div>

      <CitatDana key={korisnik?.email || "gost"} />

      <div className="mb-10">
        <Polje labela="Pretraga" placeholder="Unesite naziv ili autora..." vrednost={pretraga} promena={setPretraga} />
      </div>

      {filtrirane.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nema rezultata.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrirane.map((p) => (
            <div key={p.id} className="p-6 bg-white border-2 border-svetlo-plava rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex gap-4 mb-4">
                {/* SLIKA */}
                <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {p.slika_url ? (
                    <img src={p.slika_url} alt={p.naziv} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center">Nema slike</div>
                  )}
                </div>
                {/* TEKST */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate" title={p.naziv}>{p.naziv}</h3>
                  <p className="text-sm text-gray-500 italic truncate">{p.autor}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${p.stanje > 0 ? "bg-zuta/40 text-tamno-plava" : "bg-red-200 text-red-700"}`}>
                      Dostupno: {p.stanje}
                    </span>
                  </div>
                </div>
              </div>

              {/* DUGMIĆI NA DNU KARTICE */}
              <div className="flex gap-2 mt-auto pt-2">
                {jeSluzbenik && (
                  <Dugme naslov="Zaduži" boja="plava" onemoguceno={p.stanje <= 0} klik={() => otvoriModal(p.id)} />
                )}
                {isAdmin && (
                  <Dugme naslov="Obriši" boja="crvena" klik={() => obrisiPublikaciju(p.id)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL (Ostaje isti) */}
      {modalOtvoren && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`bg-white w-full max-w-md p-8 rounded-[2rem] border-2 border-svetlo-plava shadow-2xl space-y-6 ${mrdni ? "animate-bounce" : ""}`}>
            <h2 className="text-xl font-black text-tamno-plava uppercase text-center">Zaduživanje</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!feedback?.uspeh) izvrsiZaduzivanje(); }}>
              <Polje labela="Broj indeksa" placeholder="2020/0001" vrednost={indeks} promena={setIndeks} />
              {feedback && (
                <p className={`text-sm font-bold text-center p-2 rounded-lg ${feedback.uspeh ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                  {feedback.poruka}
                </p>
              )}
              <div className="flex flex-col gap-3">
                {!feedback?.uspeh && <Dugme naslov="Potvrdi" boja="zelena" tip="submit" />}
                <Dugme naslov="Zatvori" boja="plava" klik={() => { setModalOtvoren(false); setFeedback(null); }} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}