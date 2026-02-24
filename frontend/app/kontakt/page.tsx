"use client";
import { useEffect, useState } from "react";
import { Dugme } from "../../components/Dugme";

export default function KontaktPage() {
  const [forma, setForma] = useState({ ime: "", email: "", poruka: "" });
  const [status, setStatus] = useState<{
    tip: "uspeh" | "greska";
    tekst: string;
  } | null>(null);

  const posaljiMejl = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/kontakt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forma),
    });

    if (res.ok) {
      setStatus({ tip: "uspeh", tekst: "Poruka uspešno poslata!" });
      setForma({ ime: "", email: "", poruka: "" });
    } else {
      setStatus({
        tip: "greska",
        tekst: "Došlo je do greške, pokušajte ponovo.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-black text-tamno-plava uppercase">
          Kontaktirajte nas
        </h1>
        <p className="text-gray-500 italic">
          Informacije o radu biblioteke i direktna podrška.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12 bg-white p-10 rounded-[2rem] border-2 border-svetlo-plava shadow-sm">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-tamno-plava uppercase border-b-2 border-mint pb-2 inline-block">
            Info
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>Adresa: Studentski trg 1, Smederevo</p>
            <p>Telefon: +381 26 123 456</p>
            <p>Email: vukbojanic000@gmail.com</p>
            <p>Radno vreme: Pon - Pet (08:00 - 20:00)</p>
          </div>
        </div>

        <form onSubmit={posaljiMejl} className="space-y-4">
          <h2 className="text-xl font-bold text-tamno-plava uppercase border-b-2 border-mint pb-2 inline-block">
            Vaše mišljenje nam je važno.
          </h2>
          <input
            type="text"
            placeholder="Vaše ime"
            className="w-full px-4 py-3 border-2 border-mint/20 rounded-xl outline-none focus:border-mint transition-all"
            value={forma.ime}
            onChange={(e) => setForma({ ...forma, ime: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Vaš email"
            className="w-full px-4 py-3 border-2 border-mint/20 rounded-xl outline-none focus:border-mint transition-all"
            value={forma.email}
            onChange={(e) => setForma({ ...forma, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Kako vam možemo pomoći?"
            rows={4}
            className="w-full px-4 py-3 border-2 border-mint/20 rounded-xl outline-none focus:border-mint transition-all resize-none"
            value={forma.poruka}
            onChange={(e) => setForma({ ...forma, poruka: e.target.value })}
            required
          />

          {status && (
            <p
              className={`text-sm font-bold ${status.tip === "uspeh" ? "text-green-600" : "text-red-600"}`}
            >
              {status.tekst}
            </p>
          )}

          <Dugme naslov="Pošalji poruku" boja="zelena" tip="submit" />
        </form>
      </div>
    </div>
  );
}
