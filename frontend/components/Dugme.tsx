"use client";
export const Dugme = ({ naslov, klik, boja = "plava", onemoguceno = false }: any) => {
  const stilovi: any = {
    plava: "bg-tamno-plava hover:bg-tamno-plava/90",
    crvena: "bg-crvena hover:bg-crvena/90",
    zelena: "bg-mint hover:bg-mint/90",
    siva: "bg-gray-400"
  };

  return (
    <button 
      onClick={klik}
      disabled={onemoguceno}
      className={`${onemoguceno ? stilovi.siva : stilovi[boja]} text-white px-4 py-2 rounded shadow-md transition-all font-semibold`}
    >
      {naslov}
    </button>
  );
};