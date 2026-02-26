"use client";

interface ZaduzenjeProps {
  naziv: string;
  rok: string;
}

export const ZaduzenjeKartica = ({ naziv, rok }: ZaduzenjeProps) => {
  const danas = new Date();
  
  
  const validanDatum = !isNaN(Date.parse(rok));
  const rokDatum = validanDatum ? new Date(rok) : null;
  
  
  const jeIsteklo = rokDatum && rokDatum < danas && rok !== "Nije definisano";

  return (
    <div
      className={`flex justify-between items-center p-6 rounded-2xl border transition-all transform ${
        jeIsteklo
          ? "bg-crvena/15 border-crvena/50 hover:border-crvena hover:bg-crvena/20"
          : "bg-white border-mint/50 shadow-sm hover:shadow-md hover:border-mint/80"
      } hover:-translate-y-0.5`}
    >
      <div>
        <h3 className={`font-bold ${jeIsteklo ? "text-tamno-plava" : "text-gray-900"}`}>
          {naziv}
        </h3>
        <p className={`text-xs mt-1 font-medium ${jeIsteklo ? "text-crvena" : "text-gray-500"}`}>
         
          {validanDatum && rokDatum 
            ? `ROK ZA VRAĆANJE: ${rokDatum.toLocaleDateString("sr-RS")}` 
            : rok}
        </p>
      </div>
      {jeIsteklo && (
        <div className="text-right">
          <span className="bg-crvena text-white px-3 py-1 rounded text-[10px] font-black uppercase">
            ISTEKAO ROK
          </span>
        </div>
      )}
    </div>
  );
};