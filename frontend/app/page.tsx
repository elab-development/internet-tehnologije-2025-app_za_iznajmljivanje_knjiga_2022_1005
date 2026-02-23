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
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [selektovanaPublikacijaId, setSelektovanaPublikacijaId] = useState<
    number | null
  >(null);
  const [indeks, setIndeks] = useState("");
  const [feedback, setFeedback] = useState<{
    poruka: string;
    uspeh: boolean;
  } | null>(null);
  const [mrdni, setMrdni] = useState(false);

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

    fetch("http://localhost:5000/api/zaduzi-knjigu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publikacijaId: selektovanaPublikacijaId,
        brojIndeksa: indeks,
      }),
    })
      .then((res) => {
        const isOk = res.ok;
        return res.json().then((data) => ({ isOk, data }));
      })
      .then(({ isOk, data }) => {
        setFeedback({
          poruka: data.message,
          uspeh: isOk,
        });

        if (isOk) {
          fetch("http://localhost:5000/api/publikacije")
            .then((res) => res.json())
            .then((newData) => setPublikacije(newData));
        }
      })
      .catch(() => {
        setFeedback({ poruka: "Greška na serveru", uspeh: false });
      });
  };

  const filtrirane = publikacije.filter(
    (p) =>
      p.naziv?.toLowerCase().includes(pretraga.toLowerCase()) ||
      p.autor?.toLowerCase().includes(pretraga.toLowerCase())
  );

<<<<<<< HEAD
  if (ucitavanje) return <div className="p-10 text-center font-bold text-tamno-plava">Učitavanje...</div>;
=======
  if (ucitavanje)
    return (
      <div className="p-10 text-center font-bold text-tamno-plava">
        Učitavanje...
      </div>
    );
>>>>>>> f381f9cdc917f14c45f9aaa8c34f2e6d7c21aaee

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
<<<<<<< HEAD
            <KarticaSaPodacima 
              key={p.id} 
              p={p} 
              isAdmin={isAdmin} 
              jeSluzbenik={jeSluzbenik} 
              obrisiPublikaciju={obrisiPublikaciju} 
              handleZaduzivanje={handleZaduzivanje} 
              router={router} 
            />
=======
            <div
              key={p.id}
              className="p-6 bg-white border-2 border-svetlo-plava rounded-2xl shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h3 className="font-bold text-gray-900 truncate">
                    {p.naziv}
                  </h3>
                  <p className="text-sm text-gray-500 italic">{p.autor}</p>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded uppercase ${p.stanje > 0 ? "bg-zuta/40 text-tamno-plava" : "bg-crvena/25 text-tamno-plava"}`}
                >
                  Dostupno: {p.stanje}
                </span>
              </div>

              <div className="flex gap-2 pt-4">
                {jeSluzbenik && (
                  <Dugme
                    naslov="Zaduži"
                    boja="plava"
                    onemoguceno={p.stanje <= 0}
                    klik={() => otvoriModal(p.id)}
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
>>>>>>> f381f9cdc917f14c45f9aaa8c34f2e6d7c21aaee
          ))}
        </div>
      )}
      {modalOtvoren && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className={`bg-white w-full max-w-md p-8 rounded-[2rem] border-2 border-svetlo-plava shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 
    ${mrdni ? "animacija-skok" : ""}`}
          >
            <h2 className="text-xl font-black text-tamno-plava uppercase">
              Zaduživanje knjige
            </h2>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!feedback?.uspeh) izvrsiZaduzivanje();
              }}
            >
              <Polje
                labela="Broj indeksa studenta"
                placeholder="npr. 2020/0001"
                vrednost={indeks}
                promena={setIndeks}
              />

              {feedback && (
                <p
                  className={`text-sm font-bold text-center p-2 rounded-lg ${
                    feedback.uspeh
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {feedback.poruka}
                </p>
              )}

              <div className="flex flex-col gap-3 pt-2">
                {!feedback?.uspeh && (
                  <Dugme
                    naslov="Potvrdi zaduženje"
                    boja="zelena"
                    tip="submit"
                    klik={izvrsiZaduzivanje}
                  />
                )}
                <Dugme
                  naslov="Gotovo"
                  boja="plava"
                  tip="button"
                  klik={() => {
                    setModalOtvoren(false);
                    setFeedback(null);
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}