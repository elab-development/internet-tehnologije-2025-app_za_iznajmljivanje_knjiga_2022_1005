"use client";
import { useEffect, useState } from "react";

export default function ProfilPage() {
  const [korisnik, setKorisnik] = useState<any>(null);
  const [zaduzenja, setZaduzenja] = useState<any[]>([]);

  useEffect(() => {
    const podaci = localStorage.getItem("korisnik");
    if (podaci) {
      const user = JSON.parse(podaci);
      setKorisnik(user);

      if (user.uloga === "student") {
        setZaduzenja([
          { id: 1, naslov: "Na Drini Ćuprija", rok: "2024-05-15" },
          { id: 2, naslov: "Tvrđava", rok: "2024-01-10" },
        ]);
      }
    }
  }, []);

  if (!korisnik)
    return <div className="p-10 text-center font-bold">Niste prijavljeni.</div>;

  const isAdmin = Number(korisnik.isAdmin) === 1;
  const danas = new Date();

  let nazivUloge = "Student";
  if (isAdmin) nazivUloge = "Admin nalog";
  else if (korisnik.uloga === "sluzbenik") nazivUloge = "Službenik nalog";

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-2xl font-black uppercase">
            {korisnik.ime[0]}
            {korisnik.prezime[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase">
              {korisnik.ime} {korisnik.prezime}
            </h1>
            <p className="text-gray-500">{korisnik.email}</p>
            <div
              className={`inline-block mt-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                isAdmin ? "bg-red-600 text-white" : "bg-blue-100 text-blue-700"
              }`}
            >
              {nazivUloge}
            </div>
          </div>
        </div>
      </div>

      {}
      {korisnik.uloga === "student" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2 uppercase tracking-wide">
            Moja zaduženja
          </h2>
          <div className="grid gap-3">
            {zaduzenja.map((knjiga) => {
              const rokDatum = new Date(knjiga.rok);
              const jeIsteklo = rokDatum < danas;

              return (
                <div
                  key={knjiga.id}
                  className={`flex justify-between items-center p-6 rounded-2xl border transition-all ${
                    jeIsteklo
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-100 shadow-sm"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-bold ${jeIsteklo ? "text-red-700" : "text-gray-900"}`}
                    >
                      {knjiga.naslov}
                    </h3>
                    <p
                      className={`text-xs mt-1 font-medium ${jeIsteklo ? "text-red-500" : "text-gray-400"}`}
                    >
                      ROK ZA VRAĆANJE: {rokDatum.toLocaleDateString("sr-RS")}
                    </p>
                  </div>

                  {jeIsteklo && (
                    <div className="text-right">
                      <span className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase">
                        ISTEKAO ROK
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
