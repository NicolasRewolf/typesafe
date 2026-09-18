import type { RegleGoogle } from "@/lib/types";

/** Critères repris de la page Google « Influencer vos liens de titre ». */
export const GRILLE_GOOGLE: {
  source: string;
  pratiques: string[];
} = {
  source: "https://developers.google.com/search/docs/appearance/title-link?hl=fr",
  pratiques: [
    "Rédigez un texte descriptif et concis. Évitez les descripteurs vagues du type Accueil ou Profil.",
    "Évitez les titres inutilement longs : le lien de titre est tronqué dans les résultats Google si nécessaire.",
    "Évitez l’accumulation de mots clés (répéter les mêmes mots ou expressions).",
    "Pour chaque page, un texte distinct. Évitez les titres récurrents dont seule une information change.",
    "Ajoutez la marque tout en restant concis, au début ou à la fin, séparée par un tiret, une barre verticale ou deux points.",
    "Même langue et même système d’écriture que le contenu principal de la page.",
    "Le titre doit refléter précisément l’objet de la page.",
  ],
};

const VAGUES = /\b(accueil|profil|home|welcome|untitled|sans titre|nouvelle page)\b/iu;
const ACCUMULATION = [
  /meilleure agence/i,
  /agence de communication/i,
  /graphiste bordeaux/i,
  /agence web bordeaux/i,
];
const MOTS_METIER = new Set([
  "naming",
  "packaging",
  "branding",
  "copywriting",
  "growth",
  "seo",
  "ux",
  "ui",
  "brand",
  "book",
  "print",
  "bat",
  "plv",
  "pdf",
  "figma",
  "powerpoint",
  "wix",
  "kisskiss",
  "ads",
  "app",
  "iphone",
  "b2b",
  "b2c",
  "shooting",
  "packshot",
  "lifestyle",
  "reportage",
  "meta",
  "titles",
  "faq",
  "gsc",
]);

export function normaliserTitre(texte: string): string {
  return texte
    .replace(/\s*[|\-–—:]\s*Rewolf\s*$/i, "")
    .replace(/^Rewolf\s*[|\-–—:]\s*/i, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mots(texte: string): string[] {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((m) => m.length > 3);
}

function accumulationMotsCles(texte: string): boolean {
  if (ACCUMULATION.some((r) => r.test(texte))) return true;
  const listes = mots(texte);
  const counts = new Map<string, number>();
  for (const mot of listes) {
    counts.set(mot, (counts.get(mot) ?? 0) + 1);
  }
  for (const n of counts.values()) {
    if (n >= 3) return true;
  }
  const parties = texte.split(/,|;|\//).map((p) => p.trim()).filter(Boolean);
  if (parties.length >= 4) return true;
  return false;
}

function marqueBienPlacee(texte: string): boolean {
  const occurrences = [...texte.matchAll(/rewolf/gi)];
  if (occurrences.length !== 1) return false;
  return (
    /^(Rewolf)\s*[:|\-–—]/.test(texte) ||
    /\s[:|\-–—]\s*Rewolf$/.test(texte)
  );
}

function francais(texte: string): boolean {
  const corps = texte.replace(/\s*[|\-–—:]\s*Rewolf\s*$/i, "");
  if (!/[\p{L}]/u.test(corps)) return false;
  if (/[а-яА-Я\u0900-\u097F]/.test(corps)) return false;
  const tokens = corps
    .toLowerCase()
    .split(/[^a-zàâäéèêëïîôùûüçœ'-]+/i)
    .filter((t) => t.length > 2);
  if (tokens.length === 0) return false;
  const anglais = tokens.filter(
    (t) =>
      /^[a-z]+$/i.test(t) &&
      !MOTS_METIER.has(t) &&
      !/^(de|du|des|le|la|les|un|une|et|ou|pas|sur|pour|une|des)$/i.test(t) &&
      /^(the|and|for|with|your|best|cheap|new|official)$/i.test(t),
  );
  return anglais.length === 0;
}

function descriptifConcis(texte: string): boolean {
  const n = texte.trim().length;
  return n >= 12 && n <= 70;
}

export function noterReglesGoogle(
  texte: string,
  autresTitres: string[],
): { note: number; regles: RegleGoogle[] } {
  const trim = texte.trim();
  const regles: RegleGoogle[] = [];

  const pasVide = trim.length > 0 && !/^(Rewolf\s*)?[:|\-–—]?\s*$/i.test(trim);
  regles.push({
    id: "pas-vide",
    ok: pasVide,
    mot: pasVide
      ? "Le titre n’est pas vide."
      : "Le titre est vide, ou il ne reste que le nom du studio.",
  });

  const pasVague = !VAGUES.test(trim);
  regles.push({
    id: "pas-vague",
    ok: pasVague,
    mot: pasVague
      ? "Pas un mot vague du type Accueil ou Profil."
      : "Trop vague : Google déconseille Accueil, Profil, et les titres qui ne décrivent rien.",
  });

  const concis = descriptifConcis(trim);
  regles.push({
    id: "concis",
    ok: concis,
    mot: concis
      ? `Bonne longueur (${trim.length} caractères) : Google peut tout afficher.`
      : trim.length > 70
        ? `Un peu long (${trim.length} caractères) : Google risque de le couper.`
        : `Trop court (${trim.length} caractères) : on ne décrit pas la page.`,
  });

  const pasStuffing = !accumulationMotsCles(trim);
  regles.push({
    id: "pas-accumulation",
    ok: pasStuffing,
    mot: pasStuffing
      ? "Pas d’accumulation de mots-clés."
      : "On répète trop les mêmes mots : Google y voit du remplissage.",
  });

  const cle = normaliserTitre(trim);
  const unique = !autresTitres.some((t) => normaliserTitre(t) === cle);
  regles.push({
    id: "unique",
    ok: unique,
    mot: unique
      ? "Ce titre ne recopie pas une autre page."
      : "Trop proche d’un autre titre du site : on ne distingue plus les pages.",
  });

  const marque = marqueBienPlacee(trim);
  const doubleMarque = [...trim.matchAll(/rewolf/gi)].length > 1;
  regles.push({
    id: "marque",
    ok: marque && !doubleMarque,
    mot:
      doubleMarque
        ? "Le nom du studio apparaît deux fois : Google peut l’enlever."
        : marque
          ? "Le nom du studio est à sa place, séparé du reste."
          : "Ajoutez Rewolf au début ou à la fin, après une barre ou un tiret.",
  });

  const langue = francais(trim);
  regles.push({
    id: "langue",
    ok: langue,
    mot: langue
      ? "Le titre est en français, comme les pages."
      : "Le titre n’est pas dans la langue des pages.",
  });

  const okCount = regles.filter((r) => r.ok).length;
  const note = Math.round((okCount / regles.length) * 10);
  return { note, regles };
}
