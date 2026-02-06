"use client";
import { useEffect, useState } from "react";
import { ZaduzenjeKartica } from "../../components/ZaduzenjeKartica";
import { Dugme } from "../../components/Dugme";

export default function ProfilPage() {
  const [korisnik, setKorisnik] = useState<any>(null);
  const [zaduzenja, setZaduzenja] = useState<any[]>([]); 
  const [svaZaduzenja, setSvaZaduzenja] = useState<any[]>([]); 
  const [studenti, setStudenti] = useState<any[]>([]);
  const [sluzbenici, setSluzbenici] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = Number(korisnik?.isAdmin) === 1;
  const jeSluzbenik = korisnik?.uloga === "sluzbenik" && !isAdmin;

  const ucitajAdminPodatke = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const headers = { "Authorization": `Bearer ${token}` };

  try {
    const [resS, resSl] = await Promise.all([
      fetch("http://localhost:5000/api/admin/studenti", { headers }),
      fetch("http://localhost:5000/api/admin/sluzbenici", { headers })
    ]);

    const dataS = resS.ok ? await resS.json() : [];
    const dataSl = resSl.ok ? await resSl.json() : [];


    setStudenti(Array.isArray(dataS) ? dataS : []);
    setSluzbenici(Array.isArray(dataSl) ? dataSl : []);

  } catch (err) {
    console.error("Greška u fetch-u:", err);
    setStudenti([]);
    setSluzbenici([]);
  }
};
  const ucitajZaduzenja = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/zaduzenja/aktivna", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setSvaZaduzenja(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleRazduzi = async (id: number) => {
    if (!confirm("Potvrdi vraćanje?")) return;
    const res = await fetch(`http://localhost:5000/api/razduzi/${id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) ucitajZaduzenja();
  };

  const deaktiviraj = async (tip: string, id: number) => {
    if (!confirm(`Da li ste sigurni?`)) return;
    const res = await fetch(`http://localhost:5000/api/admin/brisi/${tip}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) ucitajAdminPodatke();
  };

  useEffect(() => {
    const podaci = localStorage.getItem("korisnik");
    if (!podaci) return;
    const user = JSON.parse(podaci);
    setKorisnik(user);

    if (user.uloga === "student") {
      fetch(`http://localhost:5000/api/zaduzenja/student/${user.id}`)
        .then(res => res.json()).then(setZaduzenja).finally(() => setLoading(false));
    } else {
      if (Number(user.isAdmin) === 1) ucitajAdminPodatke();
      if (user.uloga === "sluzbenik") ucitajZaduzenja();
      setLoading(false);
    }
  }, []);

  if (!korisnik) return <div className="p-10 text-center font-bold">Učitavanje...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
 
      <section className="bg-white rounded-[2rem] border border-gray-100 p-8 flex items-center gap-8 shadow-sm">
        <div className="w-24 h-24 bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-800 rounded-full flex items-center justify-center text-3xl font-black uppercase shadow-inner">
          {korisnik.ime?.[0]}{korisnik.prezime?.[0]}
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">{korisnik.ime} {korisnik.prezime}</h1>
          <p className="text-gray-500 font-medium">{korisnik.email}</p>
          <div className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-sm ${isAdmin ? "bg-red-500" : "bg-blue-500"}`}>
            {isAdmin ? "Administrator" : jeSluzbenik ? "Službenik" : "Student"}
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-2">Upravljanje Studentima</h2>
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
              {studenti.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-700">{s.ime} {s.prezime}</span>
                  <Dugme naslov="Ukloni" boja="crvena" klik={() => deaktiviraj('student', s.id)} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-2">Upravljanje Službenicima</h2>
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
              {sluzbenici.map((sl) => (
                <div key={sl.id} className="flex justify-between items-center p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-700">{sl.ime} {sl.prezime || ""}</span>
                  <Dugme naslov="Ukloni" boja="crvena" klik={() => deaktiviraj('sluzbenik', sl.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {jeSluzbenik && (
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 px-2">Trenutna zaduženja ({svaZaduzenja.length})</h2>
          <div className="grid gap-4">
            {svaZaduzenja.map(z => (
              <div key={z.id} className="p-6 bg-white border border-blue-50 rounded-[1.5rem] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:border-blue-200 transition-all">
                <div className="text-center md:text-left">
                  <p className="text-lg font-black uppercase text-gray-800">{z.Publikacija?.naziv || z.publikacija?.naziv || "Knjiga"}</p>
                  <p className="text-xs font-bold text-blue-500 mt-1 uppercase tracking-widest">Student ID: {z.studentId}</p>
                </div>
                <Dugme naslov="Razduži Knjigu" boja="zelena" klik={() => handleRazduzi(z.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

     
      {korisnik.uloga === "student" && (
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 px-2">Moja zaduženja</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {zaduzenja.map(z => (
              <ZaduzenjeKartica key={z.id} naziv={z.Publikacija?.naziv || z.publikacija?.naziv} rok={z.datumVracanja} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}