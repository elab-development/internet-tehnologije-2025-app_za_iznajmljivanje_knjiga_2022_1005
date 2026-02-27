"use client";
import { useEffect, useState } from "react";
import { ZaduzenjeKartica } from "../../components/ZaduzenjeKartica";
import { Dugme } from "../../components/Dugme";

export default function ProfilPage() {
  const [korisnik, setKorisnik] = useState<any>(null);
  const [zaduzenja, setZaduzenja] = useState<any[]>([]);
  const [istorijaZaduzenja, setIstorijaZaduzenja] = useState<any[]>([]);
  const [svaZaduzenja, setSvaZaduzenja] = useState<any[]>([]);
  const [studenti, setStudenti] = useState<any[]>([]);
  const [sluzbenici, setSluzbenici] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wikiPojam, setWikiPojam] = useState("");
  const [wikiData, setWikiData] = useState<any>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [pretragaIndeksa, setPretragaIndeksa] = useState("");

  const API_BASE = "https://overflowing-spirit-production-fde5.up.railway.app/api";
  const isAdmin = Number(korisnik?.isAdmin) === 1;
  const jeSluzbenik = korisnik?.uloga === "sluzbenik" && !isAdmin;

  const ucitajAdminPodatke = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resS, resSl] = await Promise.all([
        fetch(`${API_BASE}/admin/studenti`, { headers }),
        fetch(`${API_BASE}/admin/sluzbenici`, { headers }),
      ]);
      setStudenti(resS.ok ? await resS.json() : []);
      setSluzbenici(resSl.ok ? await resSl.json() : []);
    } catch (err) {
      console.error(err);
    }
  };

  const ucitajZaduzenjaSluzbenik = async () => {
    try {
      const res = await fetch(`${API_BASE}/zaduzenja/aktivna`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSvaZaduzenja(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRazduzi = async (id: number) => {
    if (!confirm("Potvrdi vraćanje?")) return;
    const res = await fetch(`${API_BASE}/razduzi/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) ucitajZaduzenjaSluzbenik();
  };

  const deaktiviraj = async (tip: string, id: number) => {
    if (!confirm(`Da li ste sigurni?`)) return;
    const res = await fetch(`${API_BASE}/admin/brisi/${tip}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) ucitajAdminPodatke();
  };

  const pretraziWiki = async () => {
    if (!wikiPojam) return;
    setWikiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/eksterni/istrazi/${wikiPojam}`);
      if (res.ok) setWikiData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setWikiLoading(false);
    }
  };

  useEffect(() => {
    const podaci = localStorage.getItem("korisnik");
    if (!podaci) return;
    const user = JSON.parse(podaci);

    const ucitajSveZaStudenta = async (id: number) => {
      try {
        const [resAktivna, resIstorija] = await Promise.all([
          fetch(`${API_BASE}/zaduzenja/student/${id}`),
          fetch(`${API_BASE}/zaduzenja/istorija/${id}`)
        ]);
        const aktivna = resAktivna.ok ? await resAktivna.json() : [];
        const istorija = resIstorija.ok ? await resIstorija.json() : [];
        
        setZaduzenja(Array.isArray(aktivna) ? aktivna : []);
        setIstorijaZaduzenja(Array.isArray(istorija) ? istorija : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        const aktuelniKorisnik = me || user;
        setKorisnik(aktuelniKorisnik);
        if (aktuelniKorisnik.uloga === "student") {
          ucitajSveZaStudenta(aktuelniKorisnik.id);
        } else {
          if (Number(aktuelniKorisnik.isAdmin) === 1) ucitajAdminPodatke();
          if (aktuelniKorisnik.uloga === "sluzbenik") ucitajZaduzenjaSluzbenik();
          setLoading(false);
        }
      })
      .catch(() => {
        setKorisnik(user);
        setLoading(false);
      });
  }, []);

  if (!korisnik) return <div className="p-10 text-center font-bold">Učitavanje...</div>;

  const filtriranaZaduzenja = svaZaduzenja.filter((z) => {
    const indeks = (z.student?.brojIndeksa || z.Student?.brojIndeksa || String(z.studentId)).toLowerCase();
    return indeks.includes(pretragaIndeksa.toLowerCase());
  });

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 max-w-6xl mx-auto space-y-12 bg-gradient-to-b from-svetlo-plava/10 via-white to-white">
      {/* Header Sekcija */}
      <section className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-mint/50 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 shadow-lg">
        <div className="w-24 h-24 bg-gradient-to-tr from-mint to-roze text-white rounded-full flex items-center justify-center text-3xl font-black uppercase shadow-inner ring-4 ring-svetlo-plava/40">
          {korisnik.ime?.[0]}{korisnik.prezime?.[0]}
        </div>
        <div className="space-y-2 text-center md:text-left">
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-mint">Moj profil</p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-tamno-plava">{korisnik.ime} {korisnik.prezime}</h1>
          <p className="text-gray-600 font-medium">E-mail: {korisnik.email}</p>
          {!isAdmin && !jeSluzbenik && (
            <p className="text-gray-600 font-medium text-sm">
              INDEKS: <span className="text-tamno-plava font-bold">{korisnik.brojIndeksa || "Nije dostupan"}</span>
            </p>
          )}
          <div className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white ${isAdmin ? "bg-crvena" : jeSluzbenik ? "bg-mint" : "bg-tamno-plava"}`}>
            {isAdmin ? "Administrator" : jeSluzbenik ? "Službenik" : "Student"}
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-roze px-2">Studenti ({studenti.length})</h2>
            <div className="bg-white rounded-[2rem] border-2 border-mint/50 overflow-hidden">
              {studenti.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-5 border-b border-mint/30 last:border-0">
                  <span className="font-bold text-gray-700">{s.ime} {s.prezime}</span>
                  <Dugme naslov="Ukloni" boja="crvena" klik={() => deaktiviraj("student", s.id)} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-roze px-2">Službenici ({sluzbenici.length})</h2>
            <div className="bg-white rounded-[2rem] border-2 border-mint/50 overflow-hidden">
              {sluzbenici.map((sl) => (
                <div key={sl.id} className="flex justify-between items-center p-5 border-b border-mint/30 last:border-0">
                  <span className="font-bold text-tamno-plava">{sl.ime} {sl.prezime}</span>
                  <Dugme naslov="Ukloni" boja="crvena" klik={() => deaktiviraj("sluzbenik", sl.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Službenik Panel */}
      {jeSluzbenik && (
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
            <h2 className="text-xl font-black uppercase text-tamno-plava">Aktivna zaduženja ({filtriranaZaduzenja.length})</h2>
            <input 
              type="text" 
              placeholder="Filter po indeksu..." 
              className="px-4 py-2 border-2 border-svetlo-plava rounded-full text-sm outline-none focus:border-mint"
              value={pretragaIndeksa}
              onChange={(e) => setPretragaIndeksa(e.target.value)}
            />
          </div>
          <div className="grid gap-4">
            {filtriranaZaduzenja.map((z) => (
              <div key={z.id} className="p-6 bg-white border-2 border-svetlo-plava rounded-[1.5rem] flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-lg font-black text-tamno-plava">{z.publikacija?.naziv || "Knjiga"}</p>
                  <p className="text-xs font-bold text-mint uppercase italic">Indeks: {z.student?.brojIndeksa || z.studentId}</p>
                </div>
                <Dugme naslov="Razduži" boja="zelena" klik={() => handleRazduzi(z.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Student Panel */}
      {korisnik.uloga === "student" && (
        <section className="space-y-10 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-svetlo-plava p-6 md:p-8">
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase text-roze px-2 flex items-center gap-2">
              <span>Trenutna zaduženja</span>
              <span className="px-2 py-0.5 rounded-full bg-roze/10 text-xs">{zaduzenja.length}</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {zaduzenja.map((z) => (
                <ZaduzenjeKartica key={z.id} naziv={z.naziv} rok={z.rok} />
              ))}
              {zaduzenja.length === 0 && <p className="text-gray-400 italic px-2">Nemate aktivnih zaduženja.</p>}
            </div>
          </div>

          <div className="space-y-6 border-t border-svetlo-plava/40 pt-6">
            <h2 className="text-xl font-black uppercase text-gray-400 px-2 flex items-center gap-2">
              <span>Istorija (Vraćene knjige)</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-500">{istorijaZaduzenja.length}</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4 opacity-80">
              {istorijaZaduzenja.map((z) => (
                <ZaduzenjeKartica key={z.id} naziv={z.publikacija?.naziv || "Knjiga"} rok="VRAĆENO" />
              ))}
              {istorijaZaduzenja.length === 0 && <p className="text-gray-400 italic px-2">Nema istorije.</p>}
            </div>
          </div>

          {/* Wiki Sekcija */}
          <div className="space-y-6 border-t border-svetlo-plava/40 pt-6">
            <h2 className="text-xl font-black uppercase text-tamno-plava px-2">Wiki pomoć</h2>
            <div className="bg-white rounded-[1.75rem] border-2 border-svetlo-plava/80 p-6">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  className="flex-1 px-4 py-2 border-2 border-mint/30 rounded-full outline-none focus:border-mint"
                  placeholder="Istraži pojam..." 
                  value={wikiPojam}
                  onChange={(e) => setWikiPojam(e.target.value)}
                />
                <Dugme naslov={wikiLoading ? "..." : "Istraži"} boja="zelena" klik={pretraziWiki} />
              </div>
              {wikiData && (
                <div className="mt-6 p-6 bg-mint/5 rounded-[1.5rem] border border-mint/20">
                  <h3 className="text-lg font-black text-tamno-plava uppercase">{wikiData.naslov}</h3>
                  <p className="text-gray-700 mt-2 italic">{wikiData.opis}</p>
                  <a href={wikiData.link} target="_blank" className="inline-block mt-4 text-xs font-black text-roze uppercase hover:underline">Ceo članak →</a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}