import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FicheRevision AI — Génère ta fiche en 30 secondes",
  description:
    "Colle ton cours, reçois une fiche de révision structurée avec points clés, définitions et QCM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        {children}
      </body>
    </html>
  );
}
