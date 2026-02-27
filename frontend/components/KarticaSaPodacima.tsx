"use client";
import React, { useState, useEffect } from "react"; 
import { Dugme } from "./Dugme";
import { API_BASE_URL } from "../lib/api";

export function KarticaSaPodacima({ p, isAdmin, jeSluzbenik, obrisiPublikaciju, handleZaduzivanje, router }: any) {
  const [eksterno, setEksterno] = useState<any>(null);

  useEffect(() => {
    // Ako već imamo sliku iz baze (p.slika_url), ne moramo zvati eksterni API
    if (p.slika_url || !p.naziv || eksterno) return;

    fetch(`${API_BASE_URL}/api/eksterni-detalji?naslov=${encodeURIComponent(p.naziv)}`)
      .then((res) => res.json())
      .then((data) => setEksterno(data))
      .catch(() => setEksterno({ slika: null }));
  }, [p.naziv, p.slika_url]);

  // Određujemo koju sliku prikazati: prioritet ima ona iz skrapera (p.slika_url)
  const konacnaSlika = p.slika_url || eksterno?.slika;

  return (
    <div className="p-6 bg-white border-2 border-svetlo-plava rounded-2xl shadow-sm space-y-4 flex flex-col">
      <div className="flex gap-4">
        <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          {konacnaSlika ? (
            <img src={konacnaSlika} alt={p.naziv} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center p-1">Nema slike</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="max-w-full">
              <h3 className="font-bold text-gray-900 truncate" title={p.naziv}>
                {p.naziv}
              </h3>
              <p className="text-sm text-gray-500 italic truncate">{p.autor}</p>
              
              {/* Prikaz ocene ako postoji */}
              {eksterno?.ocena && eksterno.ocena !== "Nema ocene" ? (
                <div className="mt-1 text-xs font-bold text-yellow-500">
                  ⭐ {eksterno.ocena} <span className="text-gray-400 font-normal">({eksterno.brojOcena})</span>
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-gray-300 italic">Nema recenzija</div>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${p.stanje > 0 ? "bg-zuta/40 text-tamno-plava" : "bg-crvena/25 text-tamno-plava"}`}>
              Dostupno: {p.stanje}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 mt-auto">
        {jeSluzbenik && (
          <Dugme
            naslov="Zaduži"
            boja="plava"
            onemoguceno={p.stanje <= 0}
            klik={() => handleZaduzivanje(p.id)}
          />
        )}
        {isAdmin && (
          <>
            <Dugme naslov="Izmeni" boja="siva" klik={() => router.push(`/izmeni-publikaciju/${p.id}`)} />
            <Dugme naslov="Obriši" boja="crvena" klik={() => obrisiPublikaciju(p.id)} />
          </>
        )}
      </div>
    </div>
  );
}