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
    const headers = { "Authorization": `Bearer ${token}` };
    const [resS, resSl] = await Promise.all([
      fetch("http://localhost:5000/api/admin/studenti", { headers }),
      fetch("http://localhost:5000/api/admin/sluzbenici", { headers })
    ]);
    setStudenti(await resS.json());
    setSluzbenici(await resSl.json());
  };

  const ucitajZaduzenja = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/zaduzenja/aktivna", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSvaZaduzenja(data); 
      }
    } catch (err) {
      console.error("Greska pri ucitavanju: ", err);
    }
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
    if (!confirm(`Deaktivirati nalog?`)) return;
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
      else if (user.uloga === "sluzbenik") ucitajZaduzenja();
      setLoading(false);
    }
  }, []);

  if (!korisnik) return <div className="p-10 text-center font-bold text-gray-400">Prijavite se.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <section className="bg-white rounded-3xl border p-8 flex items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-black uppercase">
          {korisnik.ime?.[0]}{korisnik.prezime?.[0]}
        </div>
        <div>
          <h1 className="text-xl font-black uppercase">{korisnik.ime} {korisnik.prezime}</h1>
          <p className="text-sm text-gray-500">{korisnik.email}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded text-[10px] font-black uppercase text-white ${isAdmin ? "bg-red-600" : "bg-blue-600"}`}>
            {isAdmin ? "Admin" : jeSluzbenik ? "Službenik" : "Student"}
          </span>
        </div>
      </section>

      {isAdmin && (
        <div className="grid md:grid-cols-2 gap-4">
          {[ { t: 'Studenti', d: studenti, type: 'student' }, { t: 'Službenici', d: sluzbenici, type: 'sluzbenik' } ].map(list => (
            <div key={list.t} className="bg-white p-5 rounded-3xl border">
              <h2 className="text-xs font-black uppercase mb-4">{list.t}</h2>
              {list.d.map((u: any) => (
                <div key={u.id} className="flex justify-between items-center p-2 border-b last:border-0">
                  <span className="text-sm">{u.ime} {u.prezime || ""}</span>
                  <button onClick={() => deaktiviraj(list.type, u.id)} className="text-[10px] text-red-600 font-bold uppercase">Ukloni</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {jeSluzbenik && (
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase px-2">Trenutna zaduženja ({svaZaduzenja.length})</h2>
          {svaZaduzenja.map(z => (
            <div key={z.id} className="p-4 bg-white border rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-sm font-black uppercase">{z.Publikacija?.naziv || z.publikacija?.naziv || "Knjiga"}</p>
                <p className="text-[10px] text-gray-400 font-bold">STUDENT ID: {z.studentId}</p>
              </div>
              <Dugme naslov="Razduži" boja="zelena" klik={() => handleRazduzi(z.id)} />
            </div>
          ))}
        </section>
      )}

      {korisnik.uloga === "student" && (
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase px-2">Moja zaduženja ({zaduzenja.length})</h2>
          {loading ? <p className="text-xs text-gray-400">Učitavanje...</p> : 
            zaduzenja.map(z => <ZaduzenjeKartica key={z.id} naziv={z.Publikacija?.naziv || z.publikacija?.naziv} rok={z.datumVracanja} />)
          }
        </section>
      )}
    </div>
  );
}