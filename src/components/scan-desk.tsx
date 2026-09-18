"use client";

import { useMemo, useState } from "react";

import { JobFiche } from "@/components/job-fiche";
import { ProfileFiche } from "@/components/profile-fiche";
import type { ScanResult, Verdict } from "@/lib/jobs/types";
import { DEFAULT_PROFILE } from "@/lib/profile";

type Filter = "tous" | Verdict;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "oui", label: "Oui" },
  { id: "a-voir", label: "À voir" },
  { id: "non", label: "Non" },
];

export function ScanDesk() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [lookingFor, setLookingFor] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("Rien n’est tamponné pour l’instant.");
  const [statusKind, setStatusKind] = useState<"info" | "error">("info");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [filter, setFilter] = useState<Filter>("tous");

  const visible = useMemo(() => {
    const offers = result?.offers ?? [];
    if (filter === "tous") return offers;
    return offers.filter((item) => item.verdict === filter);
  }, [filter, result]);

  async function scan() {
    setIsScanning(true);
    setStatusKind("info");
    setStatus("On ramène les offres, puis on tamponne. Une minute, parfois deux.");
    setFilter("tous");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, lookingFor }),
      });
      const payload = (await response.json()) as ScanResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "scan");

      setResult(payload);
      const count = payload.offers.length;
      const noun = count === 1 ? "fiche tamponnée" : "fiches tamponnées";
      setStatus(`${count} ${noun}, via ${payload.sourceLabel}.`);
    } catch (error) {
      const message =
        error instanceof Error && error.message !== "scan"
          ? error.message
          : "Le scan n’a pas abouti. Relance-le dans un instant.";
      setStatusKind("error");
      setStatus(message);
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <main id="bureau" className="desk">
      <ProfileFiche profile={profile} onChange={setProfile} />
      <section aria-labelledby="tampon-title">
        <p className="kicker">Atelier · Bordeaux</p>
        <h1 id="tampon-title">Les offres, tamponnées.</h1>
        <p className="lede">
          Ton profil à gauche. Un tampon par fiche : oui, non, ou à voir.
        </p>
        <form
          className="toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            void scan();
          }}
        >
          <div className="field">
            <label htmlFor="lookingFor">Je cherche</label>
            <input
              id="lookingFor"
              name="lookingFor"
              value={lookingFor}
              placeholder="Un métier, un mot"
              autoComplete="off"
              onChange={(event) => setLookingFor(event.target.value)}
            />
          </div>
          <button className="scan" type="submit" disabled={isScanning}>
            Scanner Bordeaux
          </button>
        </form>
        {result ? (
          <div className="filters" role="group" aria-label="Filtrer les tampons">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        <p className="status" data-kind={statusKind} role="status">
          {status}
        </p>
        <div className="board">
          {visible.map((item) => (
            <JobFiche key={item.offer.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
