"use client";

interface ZaduzenjeProps {
  naziv: string;
  rok: string;
}

export const ZaduzenjeKartica = ({ naziv, rok }: ZaduzenjeProps) => {
  const danas = new Date();
  const rokDatum = new Date(rok);
  const jeIsteklo = rokDatum < danas && rok !== "Nije definisano";

  return (
    <div className={`flex justify-between items-center p-6 rounded-2xl border transition-all ${
      jeIsteklo ? "bg-red-50 border-red-200" : "bg-white border-gray-100 shadow-sm"
    }`}>
      <div>
        <h3 className={`font-bold ${jeIsteklo ? "text-red-700" : "text-gray-900"}`}>
          {naziv}
        </h3>
        <p className={`text-xs mt-1 font-medium ${jeIsteklo ? "text-red-500" : "text-gray-400"}`}>
          ROK ZA VRAĆANJE: {rok !== "Nije definisano" ? rokDatum.toLocaleDateString("sr-RS") : "Nije definisano"}
        </p>
      </div>
      {jeIsteklo && (
        <div className="text-right">
          <span className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase">
            ISTEKAO ROK
          </span>
        </div>
      )}
    </div>
  );
};