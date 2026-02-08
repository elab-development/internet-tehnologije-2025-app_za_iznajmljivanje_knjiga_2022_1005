"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Polje } from "../../components/Polje";
import { Dugme } from "../../components/Dugme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [greska, setGreska] = useState("");
  const [ucitava, setUcitava] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");
    setUcitava(true);
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGreska(data.message || "Greška pri prijavi.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("korisnik", JSON.stringify(data.korisnik));
      router.push("/");
      router.refresh();
    } catch {
      setGreska("Server nije dostupan. Pokreni backend na portu 5000.");
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-12">
      <h1 className="text-2xl font-bold text-tamno-plava mb-6">Prijava</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md border-2 border-mint/50"
      >
        <Polje
          labela="Email"
          type="email"
          vrednost={email}
          promena={setEmail}
          placeholder="npr jovan@fon.bg.ac.rs"
        />
        <Polje
          labela="Lozinka"
          type="password"
          vrednost={password}
          promena={setPassword}
        />
        {greska && <p className="text-red-600 text-sm mb-4">{greska}</p>}
        <div className="flex items-center justify-between">
          <Dugme
            naslov={ucitava ? "Prijavljujem..." : "Prijavi se"}
            boja="plava"
            onemoguceno={ucitava}
          />
          <button
            type="button"
            onClick={() => router.push("/registracija")}
            className="text-sm text-roze font-semibold hover:text-tamno-plava underline"
          >
            Nemaš nalog? Registruj se.
          </button>
        </div>
      </form>
    </div>
  );
}
