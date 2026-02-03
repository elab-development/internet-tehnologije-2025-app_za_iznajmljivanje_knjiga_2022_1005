"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dugme } from "../components/Dugme";

export default function KatalogPage() {
  const [publikacije, setPublikacije] = useState<any[]>([]);
  const [korisnik, setKorisnik] = useState<any>(null);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [pretraga, setPretraga] = useState("");
  const router = useRouter();

  useEffect(() => {
    const sacuvanKorisnik = localStorage.getItem("korisnik");
    if (sacuvanKorisnik) setKorisnik(JSON.parse(sacuvanKorisnik));

    fetch("http://localhost:5000/api/publikacije")
      .then((res) => res.json())
      .then((data) => {
        setPublikacije(Array.isArray(data) ? data : []);
        setUcitavanje(false);
      })
      .catch(() => setUcitavanje(false));
  }, []);

  const isAdmin = Number(korisnik?.isAdmin) === 1;
  const jeSluzbenik = korisnik?.uloga === "sluzbenik" && !isAdmin;

  const obrisiPublikaciju = async (id: number) => {
    if (!confirm("Obrisati?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/publikacije/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setPublikacije((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Greška pri brisanju.");
    }
  };

  const handleZaduzivanje = (id: number) => {
    const indeks = prompt("Unesite broj indeksa studenta:");
    if (!indeks) return;
    fetch("http://localhost:5000/api/zaduzi-knjigu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publikacijaId: id, brojIndeksa: indeks }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.message.includes("uspešno")) window.location.reload();
      });
  };

  // Logika za filtriranje pretrage
  const filtriranePublikacije = publikacije.filter(
    (p) =>
      p.naziv?.toLowerCase().includes(pretraga.toLowerCase()) ||
      p.autor?.toLowerCase().includes(pretraga.toLowerCase()),
  );

  if (ucitavanje)
    return <div className="p-10 text-center font-bold">Ucitavanje...</div>;

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 uppercase">Katalog</h1>
        {isAdmin && (
          <Dugme
            naslov="+ Nova Publikacija"
            boja="zelena"
            klik={() => router.push("/dodaj-publikaciju")}
          />
        )}
      </div>

      {/* Polje za pretragu */}
      <div className="mb-10">
        <input
          type="text"
          placeholder="Pretraži po nazivu ili autoru..."
          className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
        />
      </div>

      {filtriranePublikacije.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Nije pronađena nijedna publikacija.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtriranePublikacije.map((p: any) => (
            <div
              key={p.id}
              className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{p.naziv}</h3>
                  <p className="text-gray-500 italic">{p.autor}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md ${p.stanje > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  Stanje: {p.stanje}
                </span>
              </div>

              <div className="flex gap-2 mt-6">
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
      )}
    </div>
  );
}
