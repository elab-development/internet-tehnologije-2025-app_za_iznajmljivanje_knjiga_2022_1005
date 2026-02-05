"use client";
import { useRouter } from "next/navigation";

export default function PotvrdaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-lg border border-gray-100 text-center">
        <div className="text-6xl mb-6">🎉✅🎉</div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          USPEŠNA REGISTRACIJA!
        </h1>

        <p className="text-gray-600 mb-8">
          Tvoj nalog je kreiran. Sada se možeš prijaviti na sistem koristeći
          svoje podatke.
        </p>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-sm text-blue-700 underline font-semibold hover:text-blue-900 transition-colors"
        >
          Idi na prijavu.
        </button>
      </div>
    </div>
  );
}
