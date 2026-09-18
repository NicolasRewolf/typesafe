import { ORDRE_BATTAILLE } from "@/data/recette";
import { expliquer } from "@/lib/explique";
import { normaliserTitre, noterReglesGoogle } from "@/lib/google-title";
import { jugerPage, type JugementTitre } from "@/lib/typesafe-titres";
import type { IdeeNotee, PageTitres, ResultatSitemap, SitemapPage } from "@/lib/types";

const LOT = 4;

function melangerNotes(code: number, typesafe: number | undefined): number {
  if (typesafe === undefined) return code;
  return Math.round((0.55 * code + 0.45 * typesafe) * 10) / 10;
}

function rangPages(pages: SitemapPage[]): SitemapPage[] {
  const index = new Map<string, number>(
    ORDRE_BATTAILLE.map((p, i) => [p, i]),
  );
  return [...pages].sort((a, b) => {
    const ia = index.get(a.path) ?? 1000;
    const ib = index.get(b.path) ?? 1000;
    return ia - ib;
  });
}

function admissible(idee: IdeeNotee): boolean {
  return idee.regles
    .filter(
      (r) =>
        r.id === "pas-accumulation" || r.id === "pas-vague" || r.id === "pas-vide",
    )
    .every((r) => r.ok);
}

function choisirGagnant(
  idees: IdeeNotee[],
  jugement: JugementTitre | null,
  titresDeja: string[],
): number {
  const pris = new Set(titresDeja.map(normaliserTitre));
  const ordre = [...idees.keys()].sort((a, b) => idees[b].note - idees[a].note);

  const libre = (i: number) =>
    admissible(idees[i]) && !pris.has(normaliserTitre(idees[i].texte));

  if (jugement && jugement.confiance >= 0.45 && libre(jugement.choix)) {
    return jugement.choix;
  }

  return ordre.find(libre) ?? ordre.find((i) => admissible(idees[i])) ?? ordre[0] ?? 0;
}

export async function noterSitemap(
  pages: SitemapPage[],
  juger: typeof jugerPage = jugerPage,
): Promise<ResultatSitemap> {
  const ordre = rangPages(pages);
  const jugements = new Map<string, JugementTitre | null>();
  let typesafe = true;

  for (let i = 0; i < ordre.length; i += LOT) {
    const lot = ordre.slice(i, i + LOT);
    const recus = await Promise.all(
      lot.map(async (page) => {
        try {
          const soeurs = pages
            .filter((p) => p.famille === page.famille && p.path !== page.path)
            .flatMap((p) => p.idees);
          return [page.path, await juger(page, page.idees, soeurs)] as const;
        } catch {
          return [page.path, null] as const;
        }
      }),
    );
    for (const [chemin, jugement] of recus) {
      jugements.set(chemin, jugement);
      if (!jugement) typesafe = false;
    }
  }

  const titresDeja: string[] = [];
  const pagesNotees: PageTitres[] = [];

  for (const page of ordre) {
    const jugement = jugements.get(page.path) ?? null;
    const idees: IdeeNotee[] = page.idees.map((texte, i) => {
      const { note, regles } = noterReglesGoogle(texte, titresDeja);
      return {
        texte,
        note: melangerNotes(note, jugement?.notes[i]),
        retenu: false,
        pourquoi: "",
        regles,
      };
    });

    const gagnant = choisirGagnant(idees, jugement, titresDeja);
    idees[gagnant].retenu = true;
    for (const idee of idees) {
      idee.pourquoi = expliquer(
        idee.texte,
        idee.note,
        idee.retenu,
        idee.regles,
        jugement !== null,
      );
    }

    titresDeja.push(idees[gagnant].texte);
    pagesNotees.push({
      path: page.path,
      nom: page.nom,
      famille: page.famille,
      familleNom: page.familleNom,
      vague: page.vague,
      questionAchat: page.questionAchat,
      retenu: idees[gagnant].texte,
      note: idees[gagnant].note,
      idees,
    });
  }

  const ecrire = pagesNotees.filter((p) => p.vague !== "etagere");
  const plusFaible = [...ecrire].sort((a, b) => a.note - b.note)[0];
  const ordreAffichage = pages.map((p) => p.path);
  pagesNotees.sort(
    (a, b) => ordreAffichage.indexOf(a.path) - ordreAffichage.indexOf(b.path),
  );

  return {
    pages: pagesNotees,
    commencerPar: plusFaible?.path ?? null,
    typesafe,
  };
}
