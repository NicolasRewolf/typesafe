import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import "./globals.css";

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const stamp = Bricolage_Grotesque({
  variable: "--font-stamp",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tampon Bordeaux",
  description: "Les offres de Bordeaux, tamponnées oui, non, ou à voir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${body.variable} ${stamp.variable} h-full`}>
      <body className="min-h-full">
        <a className="skip" href="#bureau">
          Aller au bureau
        </a>
        {children}
      </body>
    </html>
  );
}
