import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biblioteka iznajmljivanje knjiga",
  description: "Aplikacija za iznajmljivanje knjiga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-4 items-center">
          <a href="/" className="font-semibold text-blue-700 hover:text-blue-900">
            Katalog
          </a>
          <a href="/profil" className="font-semibold text-gray-600 hover:text-gray-900">
            Profil
          </a>
          <a href="/login" className="font-semibold text-gray-600 hover:text-gray-900 ml-auto">
            Prijava
          </a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
