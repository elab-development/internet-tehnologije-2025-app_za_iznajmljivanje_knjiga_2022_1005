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

    const postaviKorisnikaIZaduzenja = (k: any) => {
      setKorisnik(k);
      if (k.uloga === "student") {
        fetch(`http://localhost:5000/api/zaduzenja/student/${k.id}`)
          .then(res => res.json()).then(setZaduzenja).finally(() => setLoading(false));
      } else {
        if (Number(k.isAdmin) === 1) ucitajAdminPodatke();
        if (k.uloga === "sluzbenik") ucitajZaduzenja();
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (!token) {
      postaviKorisnikaIZaduzenja(user);
      return;
    }

    fetch("http://localhost:5000/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then((me) => {
        if (me) {
          postaviKorisnikaIZaduzenja(me);
          localStorage.setItem("korisnik", JSON.stringify(me));
        } else {
          postaviKorisnikaIZaduzenja(user);
        }
      })
      .catch(() => postaviKorisnikaIZaduzenja(user));
  }, []);

  if (!korisnik) return <div className="p-10 text-center font-bold text-tamno-plava">Učitavanje...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
 
<section className="bg-white rounded-[2rem] border-2 border-mint/60 p-8 flex items-center gap-8 shadow-sm">
        <div className="w-24 h-24 bg-gradient-to-tr from-mint to-roze text-white rounded-full flex items-center justify-center text-3xl font-black uppercase shadow-inner">
          {korisnik.ime?.[0]}{korisnik.prezime?.[0]}
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight text-tamno-plava">{korisnik.ime} {korisnik.prezime}</h1>
          <p className="text-gray-600 font-medium">E-mail: {korisnik.email}</p>
  {!isAdmin && !jeSluzbenik && (
    <p className="text-gray-600 font-medium text-sm">
       BROJ INDEKSA: <span className="text-tamno-plava font-bold">{korisnik.brojIndeksa || korisnik.student?.brojIndeksa || "Nije dostupan"}</span>
    </p> 
  )} 

 



  
  
          <div className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-sm ${isAdmin ? "bg-crvena" : jeSluzbenik ? "bg-mint" : "bg-tamno-plava"}`}>
            {isAdmin ? "Administrator" : jeSluzbenik ? "Službenik" : "Student"}
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-roze px-2">Upravljanje Studentima</h2>
            <div className="bg-white rounded-[2rem] border-2 border-mint/50 overflow-hidden shadow-sm">
              {studenti.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-5 border-b border-mint/30 last:border-0 hover:bg-mint/10 transition-colors">
                  <span className="font-bold text-gray-700">{s.ime} {s.prezime}</span>
                  <Dugme naslov="Ukloni" boja="crvena" klik={() => deaktiviraj('student', s.id)} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-roze px-2">Upravljanje Službenicima</h2>
            <div className="bg-white rounded-[2rem] border-2 border-mint/50 overflow-hidden shadow-sm">
              {sluzbenici.map((sl) => (
                <div key={sl.id} className="flex justify-between items-center p-5 border-b border-mint/30 last:border-0 hover:bg-mint/10 transition-colors">
                  <span className="font-bold text-tamno-plava">{sl.ime} {sl.prezime || ""}</span>
                  <Dugme naslov="Ukloni" boja="crvena" klik={() => deaktiviraj('sluzbenik', sl.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {jeSluzbenik && (
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-tamno-plava px-2">Trenutna zaduženja ({svaZaduzenja.length})</h2>
          <div className="grid gap-4">
            {svaZaduzenja.map(z => (
              <div key={z.id} className="p-6 bg-white border-2 border-svetlo-plava rounded-[1.5rem] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:border-mint transition-all">
                <div className="text-center md:text-left">
                  <p className="text-lg font-black uppercase text-tamno-plava">{z.Publikacija?.naziv || z.publikacija?.naziv || "Knjiga"}</p>
                  <p className="text-xs font-bold text-mint mt-1 uppercase tracking-widest">Studentov broj indeksa: {z.student?.brojIndeksa || z.Student?.brojIndeksa || z.studentId}</p>
                </div>
                <Dugme naslov="Razduži Knjigu" boja="zelena" klik={() => handleRazduzi(z.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

     
      {korisnik.uloga === "student" && (
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-roze px-2">Moja zaduženja</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {zaduzenja.filter(z => z.status !== "Vraćeno").map(z => (
              <ZaduzenjeKartica key={z.id} naziv={z.Publikacija?.naziv || z.publikacija?.naziv} rok={z.datumVracanja} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}