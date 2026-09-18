import { describe, expect, it } from "vitest";
import { chargerPages } from "@/lib/arbre";
import { noterSitemap } from "@/lib/choisir";
import { normaliserTitre, noterReglesGoogle } from "@/lib/google-title";
import type { SitemapPage } from "@/lib/types";

describe("arbre", () => {
  it("charge les 5 portes et les 25 pages filles", () => {
    const pages = chargerPages();
    expect(pages.filter((p) => p.vague === "hub")).toHaveLength(5);
    expect(pages.filter((p) => p.vague !== "hub")).toHaveLength(25);
    expect(pages.every((p) => p.idees.length >= 3)).toBe(true);
    expect(new Set(pages.map((p) => p.path)).size).toBe(30);
  });
});

describe("grille Google", () => {
  it("refuse Accueil et l’accumulation de mots-clés", () => {
    const vague = noterReglesGoogle("Accueil | Rewolf", []);
    expect(vague.regles.find((r) => r.id === "pas-vague")?.ok).toBe(false);

    const stuffing = noterReglesGoogle(
      "Packaging packaging packaging, pack packaging | Rewolf",
      [],
    );
    expect(stuffing.regles.find((r) => r.id === "pas-accumulation")?.ok).toBe(
      false,
    );
  });

  it("accepte un titre descriptif, concis, unique, avec la marque à la fin", () => {
    const { note, regles } = noterReglesGoogle(
      "Packaging jusqu’à l’usine | Rewolf",
      ["Identité visuelle | Rewolf"],
    );
    expect(regles.every((r) => r.ok)).toBe(true);
    expect(note).toBe(10);
  });

  it("détecte un titre recopié", () => {
    const { regles } = noterReglesGoogle("Packaging | Rewolf", [
      "Packaging | Rewolf",
    ]);
    expect(regles.find((r) => r.id === "unique")?.ok).toBe(false);
  });

  it("détecte le nom du studio en double", () => {
    const { regles } = noterReglesGoogle("Rewolf Packaging | Rewolf", []);
    expect(regles.find((r) => r.id === "marque")?.ok).toBe(false);
  });
});

describe("choix des titres", () => {
  it("retient un titre distinct par page", async () => {
    const pages = chargerPages();
    const resultat = await noterSitemap(pages, async () => null);
    const retenus = resultat.pages.map((p) => normaliserTitre(p.retenu));
    expect(new Set(retenus).size).toBe(retenus.length);
    expect(resultat.pages.every((p) => p.idees.filter((i) => i.retenu).length === 1)).toBe(
      true,
    );
    expect(resultat.commencerPar).toBeTruthy();
  });

  it("écoute TypeSafe si le titre proposé reste propre", async () => {
    const page: SitemapPage = chargerPages().find(
      (p) => p.path === "/creation/packaging",
    )!;
    const resultat = await noterSitemap([page], async (_p, idees) => ({
      notes: idees.map(() => 6),
      choix: 1,
      confiance: 0.9,
    }));
    expect(resultat.pages[0].retenu).toBe(page.idees[1]);
    expect(resultat.typesafe).toBe(true);
  });
});
