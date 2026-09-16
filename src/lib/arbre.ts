import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { IDEES } from "@/data/idees";
import { RECETTE } from "@/data/recette";
import type { SitemapPage } from "@/lib/types";

type Branche = {
  slug: string;
  nom: string;
  pitch?: string;
  note?: string;
  sous?: Branche[];
};

type Arbre = {
  categories: Branche[];
};

function lireArbre(): Arbre {
  const fichier = path.join(process.cwd(), "src/data/arbre.yaml");
  return parse(readFileSync(fichier, "utf8")) as Arbre;
}

function recetteDe(chemin: string): {
  vague: SitemapPage["vague"];
  questionAchat: string;
  soeurs: string[];
} {
  return (
    RECETTE[chemin] ?? {
      vague: "vague-2",
      questionAchat: "",
      soeurs: [],
    }
  );
}

function ideesDe(chemin: string, nom: string): string[] {
  const listes = IDEES[chemin];
  if (listes && listes.length >= 3) return [...listes];
  return [
    `${nom} | Rewolf`,
    `${nom}, le métier | Rewolf`,
    `${nom} — Rewolf`,
  ];
}

export function chargerPages(): SitemapPage[] {
  const arbre = lireArbre();
  const pages: SitemapPage[] = [];

  for (const famille of arbre.categories) {
    const hub = `/${famille.slug}`;
    const rHub = recetteDe(hub);
    pages.push({
      path: hub,
      slug: famille.slug,
      nom: famille.nom,
      famille: famille.slug,
      familleNom: famille.nom,
      pitch: famille.pitch ?? "",
      note: "",
      vague: rHub.vague,
      questionAchat: rHub.questionAchat,
      soeurs: rHub.soeurs,
      idees: ideesDe(hub, famille.nom),
    });

    for (const fille of famille.sous ?? []) {
      const chemin = `${hub}/${fille.slug}`;
      const r = recetteDe(chemin);
      pages.push({
        path: chemin,
        slug: fille.slug,
        nom: fille.nom,
        famille: famille.slug,
        familleNom: famille.nom,
        pitch: famille.pitch ?? "",
        note: fille.note ?? "",
        vague: r.vague,
        questionAchat: r.questionAchat,
        soeurs: r.soeurs,
        idees: ideesDe(chemin, fille.nom),
      });
    }
  }

  return pages;
}
