"use client";
export const Dugme = ({ naslov, klik, boja = "plava", onemoguceno = false }: any) => {
  const stilovi: any = {
    plava: "bg-blue-600 hover:bg-blue-700",
    crvena: "bg-red-600 hover:bg-red-700",
    zelena: "bg-green-600 hover:bg-green-700",
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