"use client";
import { useState } from "react";
import Image from "next/image";

interface PoljeZaSifruProps {
  labela: string;
  vrednost: string;
  promena: (val: string) => void;
  placeholder?: string;
}

export const PoljeZaSifru = ({
  labela,
  vrednost,
  promena,
  placeholder,
}: PoljeZaSifruProps) => {
  const [prikaziSifru, setPrikaziSifru] = useState(false);

  return (
    <div className="flex flex-col mb-4">
      <label className="mb-1 text-sm font-bold text-gray-700">{labela}</label>
      <div className="relative">
        <input
          type={prikaziSifru ? "text" : "password"}
          value={vrednost}
          onChange={(e) => promena(e.target.value)}
          placeholder={placeholder}
          className="w-full border-2 border-gray-200 p-2 pr-10 rounded focus:border-mint outline-none"
        />
        <button
          type="button"
          onClick={() => setPrikaziSifru(!prikaziSifru)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
          title={prikaziSifru ? "Sakrij lozinku" : "Prikaži lozinku"}
        >
          {prikaziSifru ? (
    <Image 
      src="/seen.png" 
      alt="Sakrij lozinku" 
      width={20} 
      height={20} 
    />
  ) : (
    <Image 
      src="/eyebrow.png" 
      alt="Prikaži lozinku" 
      width={20} 
      height={20} 
    />
  )}
        </button>
      </div>
    </div>
  );
};
