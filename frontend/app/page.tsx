"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dugme } from "../components/Dugme";
import { Polje } from "../components/Polje";
import { KarticaSaPodacima } from "../components/KarticaSaPodacima";

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
    const res = await fetch(`http://localhost:5000/api/publikacije/${id}`, { method: "DELETE" });
    if (res.ok) setPublikacije((prev) => prev.filter((p) => p.id !== id));
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

  const filtrirane = publikacije.filter(
    (p) =>
      p.naziv?.toLowerCase().includes(pretraga.toLowerCase()) ||
      p.autor?.toLowerCase().includes(pretraga.toLowerCase())
  );

  if (ucitavanje) return <div className="p-10 text-center font-bold text-tamno-plava">Učitavanje...</div>;

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-tamno-plava uppercase tracking-tight">Katalog</h1>
        {isAdmin && <Dugme naslov="+ Nova publikacija" boja="zelena" klik={() => router.push("/dodaj-publikaciju")} />}
      </div>

      <div className="mb-10">
        <Polje labela="Pretraga" placeholder="Unesite naziv ili autora..." vrednost={pretraga} promena={setPretraga} />
      </div>

      {filtrirane.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nema rezultata.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrirane.map((p) => (
            <KarticaSaPodacima 
              key={p.id} 
              p={p} 
              isAdmin={isAdmin} 
              jeSluzbenik={jeSluzbenik} 
              obrisiPublikaciju={obrisiPublikaciju} 
              handleZaduzivanje={handleZaduzivanje} 
              router={router} 
            />
          ))}
        </div>
      )}
    </div>
  );
}