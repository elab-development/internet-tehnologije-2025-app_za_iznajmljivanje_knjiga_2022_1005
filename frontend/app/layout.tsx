"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [korisnik, setKorisnik] = useState<any>(null);
  const pathname = usePathname();

  // Provera da li je trenutno ulogovani korisnik administrator
  const isAdmin = korisnik && Number(korisnik.isAdmin) === 1;

  const osveziKorisnika = () => {
    const podaci = localStorage.getItem("korisnik");
    if (podaci) {
      const parsurano = JSON.parse(podaci);
      if (JSON.stringify(parsurano) !== JSON.stringify(korisnik)) {
        setKorisnik(parsurano);
      }
    } else if (korisnik !== null) {
      setKorisnik(null);
    }
  };

  useEffect(() => {
    osveziKorisnika();
    const interval = setInterval(osveziKorisnika, 500);
    return () => clearInterval(interval);
  }, [korisnik]);

  const odjaviSe = () => {
    localStorage.clear();
    setKorisnik(null);
    window.location.href = "/login";
  };

  return (
    <html lang="sr">
      <body className="min-h-screen bg-gradient-to-b from-mint/15 via-zuta/5 to-svetlo-plava/20 text-tamno-plava antialiased font-sans">
        <nav className="bg-white/90 backdrop-blur border-b-2 border-mint/40 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex gap-8 items-center">
            <Link
              href="/"
              className="text-base font-bold uppercase tracking-tight text-tamno-plava hover:text-tamno-plava/90 transition-colors"
            >
              KATALOG
            </Link>

            {korisnik && (
              <>
                <Link
                  href="/profil"
                  className={`text-base font-bold uppercase tracking-tight ${pathname === "/profil" ? "text-roze" : "text-gray-600 hover:text-roze"}`}
                >
                  Moj Profil
                </Link>

                {/* OVAJ DEO JE DODAT: Vidi ga samo Admin */}
                {isAdmin && (
                  <Link
                    href="/kreiraj-sluzbenika"
                    className={`text-base font-bold uppercase tracking-tight ${pathname === "/kreiraj-sluzbenika" ? "text-mint" : "text-gray-600 hover:text-mint"}`}
                  >
                    Kreiraj službenika
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!korisnik ? (
              <Link
                href="/login"
                className="text-base font-bold uppercase tracking-tight bg-tamno-plava text-white px-5 py-2 rounded-xl hover:bg-tamno-plava/90 transition-colors shadow-md"
              >
                Prijava
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={odjaviSe}
                  className="text-base font-bold uppercase tracking-tight text-crvena hover:text-crvena/80 transition-colors"
                >
                  Odjavi se
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="min-h-[calc(100vh-73px)]">{children}</main>
      </body>
    </html>
  );
}
