import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";
import { GRILLE_GOOGLE } from "@/lib/google-title";
import type { SitemapPage } from "@/lib/types";

const NIVEAUX_TITRE = [
  "Vague, trompeur, trop long, ou bourré des mêmes mots — un internaute ne comprend pas la page.",
  "En partie descriptif, mais il casse une pratique Google : trop long, trop générique, ou imprécis.",
  "Suit les pratiques : on comprend de quelle page il s’agit, sans remplissage.",
  "Descriptif, concis, unique, fidèle à la page — on voit tout de suite le contenu et s’il correspond.",
] as const;

export type JugementTitre = {
  notes: number[];
  choix: number;
  confiance: number;
};

function client(): TypeSafeClient | null {
  if (!process.env.TYPESAFE_API_KEY?.trim()) return null;
  return new TypeSafeClient({
    timeout: 25000,
    logLevel: "error",
  });
}

function noteScore(valeur: unknown): number | undefined {
  if (
    valeur &&
    typeof valeur === "object" &&
    "type" in valeur &&
    valeur.type === "score" &&
    "score" in valeur &&
    typeof valeur.score === "number"
  ) {
    return valeur.score / 3;
  }
  return undefined;
}

function noteNoul(valeur: unknown): number | undefined {
  if (
    valeur &&
    typeof valeur === "object" &&
    "type" in valeur &&
    valeur.type === "noul" &&
    "noul" in valeur &&
    typeof valeur.noul === "number"
  ) {
    return valeur.noul;
  }
  return undefined;
}

export async function jugerPage(
  page: SitemapPage,
  idees: string[],
  titresSoeurs: string[],
): Promise<JugementTitre | null> {
  const ts = client();
  if (!ts || idees.length < 2) return null;

  const critereChoix: Record<string, string> = {};
  const questions: Record<string, ReturnType<typeof score> | ReturnType<typeof noul> | ReturnType<typeof choice>> =
    {};

  idees.forEach((texte, i) => {
    questions[`qualite_${i}`] = score(
      {
        question:
          "How well does this candidate follow Google's title-link practices listed in `googleTitleLink.pratiques` for the page in `page`?",
        candidate: `idees[${i}]`,
      },
      NIVEAUX_TITRE,
    );
    questions[`precis_${i}`] = noul(
      "Does `idees[${i}]` accurately describe the métier of `page`, without promising work that page does not cover?",
      {
        true: "The title matches the page's actual work and proof.",
        false: "The title is generic, misleading, or about a sister page.",
      },
    );
    critereChoix[`i${i}`] = texte;
  });

  questions.meilleur = choice(
    "Which candidate in `idees` is the best Google title link for `page`, following `googleTitleLink.pratiques`?",
    critereChoix,
  );

  const { answers } = await ts.systemOne({
    state: {
      googleTitleLink: GRILLE_GOOGLE,
      page: {
        path: page.path,
        nom: page.nom,
        famille: page.familleNom,
        pitch: page.pitch,
        note: page.note,
        questionAchat: page.questionAchat,
      },
      idees,
      titresSoeurs,
    },
    questions,
  });

  const notes = idees.map((_, i) => {
    const q = noteScore(answers[`qualite_${i}`]) ?? 0.5;
    const p = noteNoul(answers[`precis_${i}`]) ?? 0.5;
    return Math.round((0.7 * q + 0.3 * p) * 100) / 10;
  });

  const meilleur = answers.meilleur as { type?: string; choice?: string; confidence?: number };
  let choix = 0;
  let confiance = 0;
  if (meilleur?.type === "choice" && typeof meilleur.choice === "string") {
    const m = /^i(\d+)$/.exec(meilleur.choice);
    if (m) choix = Number(m[1]);
    confiance = typeof meilleur.confidence === "number" ? meilleur.confidence : 0;
  }

  return { notes, choix, confiance };
}
