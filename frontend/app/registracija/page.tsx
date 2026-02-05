"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Polje } from "../../components/Polje";
import { PoljeZaSifru } from "../../components/PoljeZaSifru";

import { Dugme } from "../../components/Dugme";

export default function RegistracijaStranica() {
  const router = useRouter();
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [brojIndeksa, setBrojIndeksa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [greska, setGreska] = useState("");
  const [ucitava, setUcitava] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");
    if (password !== confirmPassword) {
      setGreska("Lozinke se ne podudaraju.");
      return;
    }
    setUcitava(true);

    try {
      const res = await fetch("http://localhost:5000/api/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, prezime, brojIndeksa, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGreska(data.message || "Greška pri registraciji.");
        return;
      }

      // Ako backend vrati uspeh, preusmeri na prijavu
      router.push("/potvrda");
    } catch (err) {
      setGreska("Server nije dostupan ili nema endpoint za registraciju.");
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-12">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Registracija studenta
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
      >
        <Polje labela="Ime" vrednost={ime} promena={setIme} />
        <Polje labela="Prezime" vrednost={prezime} promena={setPrezime} />
        <Polje
          labela="Broj indeksa"
          vrednost={brojIndeksa}
          promena={setBrojIndeksa}
          placeholder="npr. 2022/123"
        />
        <Polje
          labela="Email"
          type="email"
          vrednost={email}
          promena={setEmail}
          placeholder="npr. jovan@fon.bg.ac.rs"
        />
        <PoljeZaSifru
          labela="Lozinka"
          vrednost={password}
          promena={setPassword}
        />
        <PoljeZaSifru
          labela="Potvrdi lozinku"
          vrednost={confirmPassword}
          promena={setConfirmPassword}
        />

        {greska && <p className="text-red-600 text-sm mb-4">{greska}</p>}

        <div className="flex items-center justify-between">
          <Dugme
            naslov={ucitava ? "Registrujem..." : "Registruj se"}
            boja="plava"
            onemoguceno={ucitava}
          />
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-blue-700 underline"
          >
            Već imaš nalog? Prijavi se.
          </button>
        </div>
      </form>
    </div>
  );
}
