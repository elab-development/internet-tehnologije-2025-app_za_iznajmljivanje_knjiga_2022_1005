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
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex gap-8 items-center">
            <Link
              href="/"
              className="font-black text-xl text-blue-800 tracking-tighter"
            >
              KATALOG
            </Link>

            {}
            {korisnik && (
              <Link
                href="/profil"
                className={`text-sm font-bold uppercase tracking-wider ${pathname === "/profil" ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
              >
                Moj Profil
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!korisnik ? (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Prijava
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded text-gray-400 uppercase">
                  Sistem Aktivan
                </span>
                <button
                  onClick={odjaviSe}
                  className="text-sm font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
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
