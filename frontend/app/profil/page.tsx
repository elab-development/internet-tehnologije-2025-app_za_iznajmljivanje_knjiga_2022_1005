"use client";
import { useEffect, useState } from "react";
import { ZaduzenjeKartica } from "../../components/ZaduzenjeKartica";

export default function ProfilPage() {
  const [korisnik, setKorisnik] = useState<any>(null);
  const [zaduzenja, setZaduzenja] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const podaci = localStorage.getItem("korisnik");
    if (podaci) {
      const user = JSON.parse(podaci);
      setKorisnik(user);

    
      if (user.uloga === "student") {
        fetch(`http://localhost:5000/api/zaduzenja/student/${user.id}`)
          .then((res) => res.json())
          .then((data) => {
            setZaduzenja(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Greška pri učitavanju:", err);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, []);

  if (!korisnik) {
    return <div className="p-10 text-center font-bold">Niste prijavljeni.</div>;
  }

  const isAdmin = Number(korisnik.isAdmin) === 1;
  let nazivUloge = "Student";
  if (isAdmin) nazivUloge = "Admin nalog";
  else if (korisnik.uloga === "sluzbenik") nazivUloge = "Službenik nalog";

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Kartica Profila */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-2xl font-black uppercase">
            {korisnik.ime?.[0]}{korisnik.prezime?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase">
              {korisnik.ime} {korisnik.prezime}
            </h1>
            <p className="text-gray-500">{korisnik.email}</p>
            <div className={`inline-block mt-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              isAdmin ? "bg-red-600 text-white" : "bg-blue-100 text-blue-700"
            }`}>
              {nazivUloge}
            </div>
          </div>
        </div>
      </div>

   
      {korisnik.uloga === "student" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2 uppercase tracking-wide">
            Moja zaduženja ({zaduzenja.length})
          </h2>
          
          {loading ? (
            <p className="text-gray-400 px-2">Učitavanje zaduženja...</p>
          ) : (
            <div className="grid gap-3">
              {zaduzenja.length > 0 ? (
                zaduzenja.map((z) => (
                  <ZaduzenjeKartica 
                    key={z.id}
                    naziv={z.Publikacija?.naziv|| "Nepoznata publikacija"}
                    rok={z.datumVracanja || "Nije definisano"}
                  />
                ))
              ) : (
                <p className="text-gray-400 px-2 italic">Nemate aktivnih zaduženja.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}