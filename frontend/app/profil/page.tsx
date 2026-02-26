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
  const [wikiPojam, setWikiPojam] = useState("");
  const [wikiData, setWikiData] = useState<any>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [istorijaZaduzenja, setIstorijaZaduzenja] = useState<any[]>([]);
  const [pretragaIndeksa, setPretragaIndeksa] = useState("");
  const isAdmin = Number(korisnik?.isAdmin) === 1;
  const jeSluzbenik = korisnik?.uloga === "sluzbenik" && !isAdmin;

  const ucitajAdminPodatke = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resS, resSl] = await Promise.all([
        fetch("process.env.NEXT_PUBLIC_API_URL/api/admin/studenti", { headers }),
        fetch("process.env.NEXT_PUBLIC_API_URL/api/admin/sluzbenici", { headers }),
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
      const res = await fetch("process.env.NEXT_PUBLIC_API_URL/api/zaduzenja/aktivna", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) setSvaZaduzenja(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleRazduzi = async (id: number) => {
    if (!confirm("Potvrdi vraćanje?")) return;
    const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/api/razduzi/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) ucitajZaduzenja();
  };

  const deaktiviraj = async (tip: string, id: number) => {
    if (!confirm(`Da li ste sigurni?`)) return;
    const res = await fetch(
      `process.env.NEXT_PUBLIC_API_UR/api/admin/brisi/${tip}/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    if (res.ok) ucitajAdminPodatke();
  };
  const pretraziWiki = async () => {
    if (!wikiPojam) return;
    setWikiLoading(true);
    try {
      const res = await fetch(
        `process.env.NEXT_PUBLIC_API_URL/api/eksterni/istrazi/${wikiPojam}`,
      );
      if (res.ok) {
        const data = await res.json();
        setWikiData(data);
      } else {
        alert("Pojam nije pronađen.");
        setWikiData(null);
      }
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
    setKorisnik(user);

    const postaviKorisnikaIZaduzenja = (k: any) => {
      setKorisnik(k);
      if (k.uloga === "student") {
        fetch(`process.env.NEXT_PUBLIC_API_URL/api/zaduzenja/student/${k.id}`)
          .then((res) => res.json())
          .then(setZaduzenja)
          .finally(() => setLoading(false));
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

    fetch("process.env.NEXT_PUBLIC_API_URL/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
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

  if (!korisnik)
    return (
      <div className="p-10 text-center font-bold text-tamno-plava">
        Učitavanje...
      </div>
    );

  const filtriranaZaduzenja = svaZaduzenja.filter((z) => {
    const brojIndeksa = (
      z.student?.brojIndeksa ||
      z.Student?.brojIndeksa ||
      String(z.studentId)
    ).toLowerCase();
    return brojIndeksa.includes(pretragaIndeksa.toLowerCase());
  });
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 max-w-6xl mx-auto space-y-12 bg-gradient-to-b from-svetlo-plava/10 via-white to-white">
      <section className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-mint/50 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 shadow-lg">
        <div className="w-24 h-24 bg-gradient-to-tr from-mint to-roze text-white rounded-full flex items-center justify-center text-3xl font-black uppercase shadow-inner ring-4 ring-svetlo-plava/40">
          {korisnik.ime?.[0]}
          {korisnik.prezime?.[0]}
        </div>
        <div className="space-y-2 text-center md:text-left">
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-mint">
            Moj profil
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-tamno-plava">
            {korisnik.ime} {korisnik.prezime}
          </h1>
          <p className="text-gray-600 font-medium">E-mail: {korisnik.email}</p>
          {!isAdmin && !jeSluzbenik && (
            <p className="text-gray-600 font-medium text-sm">
              BROJ INDEKSA:{" "}
              <span className="text-tamno-plava font-bold">
                {korisnik.brojIndeksa ||
                  korisnik.student?.brojIndeksa ||
                  "Nije dostupan"}
              </span>
            </p>
          )}
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-sm ${isAdmin ? "bg-crvena" : jeSluzbenik ? "bg-mint" : "bg-tamno-plava"}`}
          >
            {isAdmin ? "Administrator" : jeSluzbenik ? "Službenik" : "Student"}
          </div>
        </div>
      </section>

        {isAdmin && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-roze px-2">
              <span>Upravljanje Studentima</span>
              <span className="ml-4 px-2 py-0.5 rounded-full bg-roze/10 text-[9px] tracking-[0.15em]">
                {studenti.length}
              </span>
            </h2>
            <div className="bg-white rounded-[2rem] border-2 border-mint/50 overflow-hidden shadow-sm">
              {studenti.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-5 border-b border-mint/30 last:border-0 hover:bg-mint/10 transition-colors"
                >
                  <span className="font-bold text-gray-700">
                    {s.ime} {s.prezime}
                  </span>
                  <Dugme
                    naslov="Ukloni"
                    boja="crvena"
                    klik={() => deaktiviraj("student", s.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-roze px-2">
              <span>Upravljanje Službenicima</span>
              <span className="ml-4 px-2 py-0.5 rounded-full bg-roze/10 text-[9px] tracking-[0.15em]">
                {sluzbenici.length}
              </span>
            </h2>
            <div className="bg-white rounded-[2rem] border-2 border-mint/50 overflow-hidden shadow-sm">
              {sluzbenici.map((sl) => (
                <div
                  key={sl.id}
                  className="flex justify-between items-center p-5 border-b border-mint/30 last:border-0 hover:bg-mint/10 transition-colors"
                >
                  <span className="font-bold text-tamno-plava">
                    {sl.ime} {sl.prezime || ""}
                  </span>
                  <Dugme
                    naslov="Ukloni"
                    boja="crvena"
                    klik={() => deaktiviraj("sluzbenik", sl.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {jeSluzbenik && (
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
            <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-tamno-plava">
              <span>Trenutna zaduženja</span>
              <span className="px-2 py-0.5 rounded-full bg-mint/10 text-xs text-mint tracking-widest">
                {filtriranaZaduzenja.length}
              </span>
            </h2>

            {/* Polje za filter po indeksu */}
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Filter po indeksu..."
                className="w-full px-4 py-2 border-2 border-svetlo-plava rounded-full outline-none focus:border-mint transition-all text-sm"
                value={pretragaIndeksa}
                onChange={(e) => setPretragaIndeksa(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {/* Mapiramo filtriranaZaduzenja umesto svaZaduzenja */}
            {filtriranaZaduzenja.map((z) => (
              <div
                key={z.id}
                className="p-6 bg-white border-2 border-svetlo-plava rounded-[1.5rem] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:border-mint transition-all"
              >
                <div className="text-center md:text-left">
                  <p className="text-lg font-black uppercase text-tamno-plava">
                    {z.Publikacija?.naziv || z.publikacija?.naziv || "Knjiga"}
                  </p>
                  <p className="text-xs font-bold text-mint mt-1 uppercase tracking-widest">
                    Studentov broj indeksa:{" "}
                    {z.student?.brojIndeksa ||
                      z.Student?.brojIndeksa ||
                      z.studentId}
                  </p>
                </div>
                <Dugme
                  naslov="Razduži Knjigu"
                  boja="zelena"
                  klik={() => handleRazduzi(z.id)}
                />
              </div>
            ))}

            {/* Poruka ako nema rezultata pretrage */}
            {filtriranaZaduzenja.length === 0 && (
              <p className="text-gray-400 italic px-2">
                Nema zaduženja koja se poklapaju sa unetim indeksom.
              </p>
            )}
          </div>
        </section>
      )}

      {korisnik.uloga === "student" && (
        <section className="space-y-10 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-svetlo-plava shadow-md p-6 md:p-8">
          <div className="space-y-6">
            <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-roze px-2">
              <span>Trenutna zaduženja</span>
              <span className="px-2 py-0.5 rounded-full bg-roze/10 text-xs tracking-widest">
                {zaduzenja.filter((z) => z.status === "Aktivno").length}
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {zaduzenja
                .filter((z) => z.status === "Aktivno")
                .map((z) => (
                  <ZaduzenjeKartica key={z.id} naziv={z.naziv} rok={z.rok} />
                ))}
              {zaduzenja.filter((z) => z.status !== "Vraćeno").length === 0 && (
                <p className="text-gray-400 italic px-2">
                  Trenutno nemate aktivnih zaduženja.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 border-t border-svetlo-plava/40 pt-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-400 px-2 flex items-center gap-2">
              <span>Istorija (Vraćene knjige)</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] tracking-widest text-gray-500">
                {zaduzenja.filter((z) => z.status === "Vraćeno").length}
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4 opacity-80">
              {zaduzenja
                .filter((z) => z.status === "Vraćeno")
                .map((z) => (
                  <ZaduzenjeKartica
                    key={z.id}
                    naziv={z.naziv}
                    rok="KNJIGA JE USPEŠNO VRAĆENA."
                  />
                ))}
            </div>
          </div>

          <div className="space-y-6 border-t border-svetlo-plava/40 pt-6">
            <h2 className="flex items-center justify-between text-xl font-black uppercase tracking-tight text-tamno-plava px-2">
              <span>Pretraži nepoznati pojam na Vikipediji</span>
              <span className="text-[10px] px-3 py-1 rounded-full bg-mint/10 text-mint tracking-[0.25em] uppercase">
                Wiki pomoć
              </span>
            </h2>
            <div className="bg-white rounded-[1.75rem] border-2 border-svetlo-plava/80 p-6 shadow-sm">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Istraži pojam (npr. Next.js, Docker...)"
                  className="flex-1 px-4 py-2 border-2 border-mint/30 rounded-full outline-none focus:border-mint transition-all"
                  value={wikiPojam}
                  onChange={(e) => setWikiPojam(e.target.value)}
                />
                <Dugme
                  naslov={wikiLoading ? "Učitavanje..." : "Istraži"}
                  boja="zelena"
                  klik={pretraziWiki}
                />
              </div>

              {wikiData && (
                <div className="mt-6 p-6 bg-mint/5 rounded-[1.5rem] border border-mint/20 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-lg font-black text-tamno-plava uppercase">
                    {wikiData.naslov}
                  </h3>
                  <p className="text-gray-700 mt-2 leading-relaxed italic">
                    {wikiData.opis}
                  </p>
                  <a
                    href={wikiData.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-xs font-black uppercase tracking-widest text-roze hover:underline"
                  >
                    Pročitaj ceo članak na Vikipediji →
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
