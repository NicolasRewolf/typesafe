import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import "./tampon.css";

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

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`tampon ${body.variable} ${stamp.variable}`}>
      <a className="skip" href="#bureau">
        Aller au bureau
      </a>
      {children}
    </div>
  );
}
