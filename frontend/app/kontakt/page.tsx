"use client";
import { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { Dugme } from "../../components/Dugme";

const lokacije = [
  { 
    id: 1, 
    naziv: "Narodna biblioteka Srbije", 
    pozicija: { lat: 44.7972, lng: 20.4671 }, 
    opis: "Skerlićeva 1, Vračar" 
  },
  { 
    id: 2, 
    naziv: "Biblioteka grada Beograda", 
    pozicija: { lat: 44.8189, lng: 20.4578 }, 
    opis: "Studentski trg 19" 
  },
  { 
    id: 3, 
    naziv: "Univerzitetska biblioteka Svetozar Marković", 
    pozicija: { lat: 44.8058, lng: 20.4735 }, 
    opis: "Bulevar kralja Aleksandra 71" 
  },
  { 
    id: 4, 
    naziv: "Biblioteka FON", 
    pozicija: { lat: 44.7727, lng: 20.4752 }, 
    opis: "Jove Ilića 154, Voždovac" 
  },
  { 
    id: 5, 
    naziv: "Biblioteka FPN", 
    pozicija: { lat: 44.7721, lng: 20.4740 }, 
    opis: "Jove Ilića 165, Voždovac" 
  },
  { 
    id: 6, 
    naziv: "Biblioteka Saobraćajnog fakulteta", 
    pozicija: { lat: 44.7730, lng: 20.4780 }, 
    opis: "Vojvode Stepe 305" 
  }
];

const centarBeograda = { lat: 44.7900, lng: 20.4700 };

export default function KontaktPage() {
  const [forma, setForma] = useState({ ime: "", email: "", poruka: "" });
  const [status, setStatus] = useState<{ tip: "uspeh" | "greska", tekst: string } | null>(null);
  const [selektovanaLib, setSelektovanaLib] = useState<any>(null);

  const posaljiMejl = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("https://overflowing-spirit-production-fde5.up.railway.app/api/kontakt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forma),
    });

    if (res.ok) {
      setStatus({ tip: "uspeh", tekst: "Poruka uspešno poslata!" });
      setForma({ ime: "", email: "", poruka: "" });
    } else {
      setStatus({ tip: "greska", tekst: "Došlo je do greške, pokušajte ponovo." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-black text-tamno-plava uppercase italic">Kontaktirajte nas</h1>
        <p className="text-gray-500 italic">Informacije o radu biblioteka i direktna podrška.</p>
      </section>

      <div className="grid md:grid-cols-2 gap-12 bg-white p-10 rounded-[2rem] border-2 border-svetlo-plava shadow-sm">
        <div className="space-y-6 text-black">
          <h2 className="text-xl font-bold text-tamno-plava uppercase border-b-2 border-mint pb-2 inline-block">Info</h2>
          <div className="space-y-4 text-gray-600">
            <p><strong>Lokacije:</strong> Beograd (Centar, Vračar, Voždovac)</p>
            <p><strong>Telefon:</strong> +381 11 123 456</p>
            <p><strong>Email:</strong> vukbojanic000@gmail.com</p>
            <p><strong>Radno vreme:</strong> Pon - Pet (08:00 - 20:00)</p>
          </div>
        </div>

        <form onSubmit={posaljiMejl} className="space-y-4">
          <input
            type="text"
            placeholder="Vaše ime"
            className="w-full px-4 py-3 border-2 border-mint/20 rounded-xl outline-none focus:border-mint transition-all text-black"
            value={forma.ime}
            onChange={(e) => setForma({ ...forma, ime: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Vaš email"
            className="w-full px-4 py-3 border-2 border-mint/20 rounded-xl outline-none focus:border-mint transition-all text-black"
            value={forma.email}
            onChange={(e) => setForma({ ...forma, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Kako vam možemo pomoći?"
            rows={4}
            className="w-full px-4 py-3 border-2 border-mint/20 rounded-xl outline-none focus:border-mint transition-all resize-none text-black"
            value={forma.poruka}
            onChange={(e) => setForma({ ...forma, poruka: e.target.value })}
            required
          />
          
          {status && (
            <p className={`text-sm font-bold ${status.tip === "uspeh" ? "text-green-600" : "text-red-600"}`}>
              {status.tekst}
            </p>
          )}

          <Dugme naslov="Pošalji poruku" boja="zelena" tip="submit" />
        </form>
      </div>

      <section className="w-full h-[500px] overflow-hidden rounded-[2rem] shadow-xl border-4 border-white ring-2 ring-svetlo-plava">
        <APIProvider apiKey={"AIzaSyB9_ALeZQUgzhl75smI-rBY8J2xGpzny0g"}>
          <Map
            defaultCenter={centarBeograda}
            defaultZoom={12}
            mapId={"DEMO_MAP_ID"}
            disableDefaultUI={true}
            gestureHandling={'greedy'}
          >
            {lokacije.map((lib) => (
              <AdvancedMarker
                key={lib.id}
                position={lib.pozicija}
                onClick={() => setSelektovanaLib(lib)}
              >
                <Pin 
                  background={'#F97373'} 
                  glyphColor={'#ffffff'} 
                  borderColor={'#B91C1C'} 
                />
              </AdvancedMarker>
            ))}

            {selektovanaLib && (
              <InfoWindow
                position={selektovanaLib.pozicija}
                onCloseClick={() => setSelektovanaLib(null)}
              >
                <div className="p-2 text-black">
                  <h3 className="font-bold border-b border-mint mb-1">{selektovanaLib.naziv}</h3>
                  <p className="text-xs text-gray-700">{selektovanaLib.opis}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </section>
    </div>
  );
}