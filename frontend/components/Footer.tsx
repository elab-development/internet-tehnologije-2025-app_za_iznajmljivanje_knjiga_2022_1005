"use client";

import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-tamno-plava text-white py-10 mt-auto border-t-4 border-mint">
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-mint">
            Biblioteka "Biblos"
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Vaš prozor u svet znanja i mašte. Nudimo bogat fond publikacija i
            digitalnih resursa za studente i istraživače.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-roze">
            Lokacija
          </h3>
          <p className="text-gray-300 text-sm">
            Trg Studenata 12, <br />
            11000 Beograd, Srbija
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-roze">
            Kontakt
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-mint">Telefon:</span> +381 11 123 4567
            </li>
            <li className="flex items-center gap-2">
              <span className="text-mint">E-mail:</span> kontakt@svetreči.rs
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-roze">
            Radno vreme
          </h3>
          <p className="text-gray-300 text-sm">
            Pon - Pet: 08:00 - 20:00 <br />
            Subota: 09:00 - 15:00
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 mt-10 pt-6 border-t border-white/10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          © {new Date().getFullYear()} Biblioteka "Svet reči". Sva prava
          zadržana.
        </p>
      </div>
    </footer>
  );
};
