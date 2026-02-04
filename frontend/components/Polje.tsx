"use client";

interface PoljeProps {
  labela: string;
  type?: string;
  vrednost: string | number;
  promena?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const Polje = ({ labela, type = "text", vrednost, promena, placeholder, readOnly }: PoljeProps) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 text-sm font-bold text-gray-700">{labela}</label>
    <input 
      type={type} 
      value={vrednost ?? ""} 
      onChange={promena ? (e) => promena(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      className="border-2 p-2 rounded focus:border-blue-500 outline-none disabled:bg-gray-100"
    />
  </div>
);