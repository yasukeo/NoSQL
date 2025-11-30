import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyFlight Airlines - Flight Management System",
  description: "Système de gestion de vols - Projet NoSQL MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
