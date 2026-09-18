"use client";

import { useMemo, useState } from "react";
import { etiquterVague, noteSurDix } from "@/lib/explique";
import type { PageTitres, ResultatSitemap, Vague } from "@/lib/types";

type PageApercu = {
  path: string;
  nom: string;
  famille: string;
  familleNom: string;
  vague: Vague;
  questionAchat: string;
  idees: string[];
};

function couleurNote(note: number): string {
  if (note >= 8) return "text-good";
  if (note >= 6) return "text-mid";
  return "text-bad";
}

function Famille({
  nom,
  pages,
  resultat,
}: {
  nom: string;
  pages: PageApercu[];
  resultat: ResultatSitemap | null;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl tracking-tight">{nom}</h2>
      <ul className="mt-5 grid gap-4">
        {pages.map((page) => {
          const notee = resultat?.pages.find((p) => p.path === page.path);
          return (
            <li key={page.path}>
              <Carte page={page} notee={notee} prioritaire={resultat?.commencerPar === page.path} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Carte({
  page,
  notee,
  prioritaire,
}: {
  page: PageApercu;
  notee?: PageTitres;
  prioritaire: boolean;
}) {
  const badge = etiquterVague(page.vague);
  return (
    <article
      id={page.path}
      className={`rounded-2xl border bg-card p-5 sm:p-6 ${
        prioritaire ? "border-accent shadow-[0_0_0_1px_var(--accent)]" : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-muted">{page.path}</p>
        <div className="flex flex-wrap gap-2">
          {prioritaire ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-paper">
              Commencez par celle-ci
            </span>
          ) : null}
          {badge ? (
            <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      <h3 className="titre mt-2 text-xl">{page.nom}</h3>
      {page.questionAchat ? (
        <p className="mt-1 text-sm text-muted">{page.questionAchat}</p>
      ) : null}

      {notee ? (
        <div className="mt-5">
          <p className={`text-sm font-semibold ${couleurNote(notee.note)}`}>
            {noteSurDix(notee.note)}
          </p>
          <p className="titre mt-2 text-2xl leading-snug">{notee.retenu}</p>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed">
            {notee.idees.find((i) => i.retenu)?.pourquoi}
          </p>
          <ul className="mt-5 grid gap-2">
            {notee.idees
              .filter((i) => !i.retenu)
              .map((idee) => (
                <li
                  key={idee.texte}
                  className="flex flex-col gap-1 rounded-xl border border-line px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span>{idee.texte}</span>
                  <span className={`shrink-0 text-sm ${couleurNote(idee.note)}`}>
                    {noteSurDix(idee.note)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-4 list-disc pl-5 text-muted">
          {page.idees.map((idee) => (
            <li key={idee}>{idee}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function Atelier({ pages }: { pages: PageApercu[] }) {
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<ResultatSitemap | null>(null);

  const familles = useMemo(() => {
    const ordre: { slug: string; nom: string }[] = [];
    for (const page of pages) {
      if (!ordre.some((f) => f.slug === page.famille)) {
        ordre.push({ slug: page.famille, nom: page.familleNom });
      }
    }
    return ordre;
  }, [pages]);

  async function noter() {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/titres", { method: "POST" });
      const data = (await reponse.json()) as ResultatSitemap & { erreur?: string };
      if (!reponse.ok) {
        setErreur(data.erreur ?? "On n’a pas pu noter les titres.");
        return;
      }
      setResultat(data);
      if (data.commencerPar) {
        document.getElementById(data.commencerPar)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch {
      setErreur("On n’a pas pu noter les titres. Réessayez dans un instant.");
    } finally {
      setChargement(false);
    }
  }

  const prioritaire = resultat?.pages.find((p) => p.path === resultat.commencerPar);

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-16">
      <header>
        <p className="text-sm tracking-[0.2em] text-muted uppercase">Typeface</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          Les titres des pages, notés simplement.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Pour chaque page du sitemap, plusieurs idées. Une note, un court pourquoi.
          On garde le titre le plus clair pour Google.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={noter}
          disabled={chargement}
          className="rounded-full bg-ink px-6 py-3 text-base font-semibold text-paper disabled:opacity-60"
        >
          {chargement
            ? "On note les titres…"
            : resultat
              ? "Recommencer"
              : "Noter les titres"}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {chargement
            ? "Une petite minute. On lit chaque page, puis on choisit."
            : resultat?.typesafe === false
              ? "Notes d’après la longueur, la clarté et le nom du studio. Réessayez pour affiner."
              : null}
        </p>
      </div>

      {erreur ? (
        <p className="mt-6 rounded-xl border border-bad/30 bg-bad/5 px-4 py-3" role="alert">
          {erreur}
        </p>
      ) : null}

      {prioritaire ? (
        <p className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 text-[17px] leading-relaxed">
          <strong className="font-semibold">Prochaine étape :</strong> gardez{" "}
          <span className="titre">{prioritaire.retenu}</span> pour {prioritaire.nom}.
        </p>
      ) : null}

      <div className="mt-4">
        {familles.map((famille) => (
          <Famille
            key={famille.slug}
            nom={famille.nom}
            pages={pages.filter((p) => p.famille === famille.slug)}
            resultat={resultat}
          />
        ))}
      </div>
    </div>
  );
}
