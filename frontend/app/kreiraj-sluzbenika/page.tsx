"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Polje } from "../../components/Polje";
import { PoljeZaSifru } from "../../components/PoljeZaSifru";
import { Dugme } from "../../components/Dugme";
import { API_BASE_URL } from "../../lib/api";

export default function KreirajSluzbenika() {
  const router = useRouter();
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [greska, setGreska] = useState("");
  const [uspeh, setUspeh] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");
    setUspeh("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/kreiraj-sluzbenika`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ime, prezime, email, password, uloga: "sluzbenik" }),
      });

      if (res.ok) {
        setUspeh("Službenik uspešno kreiran!");
        setIme(""); setEmail(""); setPassword(""); setPrezime("");
      } else {
        const data = await res.json();
        setGreska(data.message || "Greška pri kreiranju.");
      }
    } catch (err) {
      setGreska("Server nije dostupan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-12">
      <h1 className="text-3xl font-black text-tamno-plava mb-8 text-center uppercase tracking-tight">
        Novi Službenik
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2rem] border-2 border-roze/30 shadow-xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Polje labela="Ime" vrednost={ime} promena={setIme} />
          <Polje labela="Prezime" vrednost={prezime} promena={setPrezime} />
        </div>
        
        <Polje labela="Email" type="email" vrednost={email} promena={setEmail} />
        <PoljeZaSifru labela="Lozinka" vrednost={password} promena={setPassword} />

        {greska && <p className="text-crvena text-sm font-bold text-center">{greska}</p>}
        {uspeh && <p className="text-mint text-sm font-bold text-center">{uspeh}</p>}

        <div className="pt-4">
          <Dugme 
            naslov={loading ? "Kreiranje..." : "Kreiraj nalog"} 
            boja="plava" 
            tip="submit"
            onemoguceno={loading} 
          />
        </div>
      </form>
    </div>
  );
}