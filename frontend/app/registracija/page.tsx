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

      router.push("/potvrda");
    } catch (err) {
      setGreska("Server nije dostupan ili nema endpoint za registraciju.");
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-12">
      <h1 className="text-3xl font-bold text-tamno-plava mb-8 text-center">
        Registracija studenta
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-lg border-2 border-mint/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Polje labela="Ime" vrednost={ime} promena={setIme} />
          <Polje labela="Prezime" vrednost={prezime} promena={setPrezime} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {greska && (
          <p className="text-crvena text-sm my-4 font-medium text-center">
            {greska}
          </p>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
          <Dugme
            naslov={ucitava ? "Registrujem..." : "Registruj se"}
            boja="plava"
            onemoguceno={ucitava}
            tip="submit"
          />
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-roze font-semibold hover:text-tamno-plava underline"
          >
            Već imaš nalog? Prijavi se.
          </button>
        </div>
      </form>
    </div>
  );
}
