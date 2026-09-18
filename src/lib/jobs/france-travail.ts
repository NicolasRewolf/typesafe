import { stripHtml, truncate } from "@/lib/jobs/text";
import type { JobOffer } from "@/lib/jobs/types";

const TOKEN_URL =
  "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire";
const SEARCH_URL =
  "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const SCOPE = "api_offresdemploiv2 o2dsoffre";
const BORDEAUX = "33063";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

interface FranceTravailOffer {
  id?: string;
  intitule?: string;
  description?: string;
  typeContratLibelle?: string;
  typeContrat?: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  salaire?: { libelle?: string };
  origineOffre?: { urlOrigine?: string };
}

function hasCredentials(): boolean {
  return Boolean(process.env.FT_CLIENT_ID && process.env.FT_CLIENT_SECRET);
}

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000)
    return tokenCache.token;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.FT_CLIENT_ID ?? "",
    client_secret: process.env.FT_CLIENT_SECRET ?? "",
    scope: SCOPE,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok)
    throw new Error("france-travail-token");

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!payload.access_token) throw new Error("france-travail-token");

  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 600) * 1000,
  };
  return tokenCache.token;
}

function toOffer(raw: FranceTravailOffer): JobOffer | null {
  const id = raw.id?.trim();
  const title = raw.intitule?.trim();
  if (!id || !title) return null;

  const url =
    raw.origineOffre?.urlOrigine?.trim() ||
    `https://candidat.francetravail.fr/offres/recherche/detail/${id}`;

  return {
    id: `ft-${id}`,
    title,
    company: raw.entreprise?.nom?.trim() || "Entreprise non nommée",
    location: raw.lieuTravail?.libelle?.trim() || "Bordeaux",
    contract: raw.typeContratLibelle?.trim() || raw.typeContrat?.trim() || "",
    salary: raw.salaire?.libelle?.trim() || "",
    description: truncate(stripHtml(raw.description ?? "")),
    url,
    source: "france-travail",
  };
}

export async function searchFranceTravail(queries: string[]): Promise<JobOffer[]> {
  if (!hasCredentials()) return [];

  const token = await accessToken();
  const offers: JobOffer[] = [];

  for (const query of queries) {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("commune", BORDEAUX);
    url.searchParams.set("distance", "20");
    if (query) url.searchParams.set("motsCles", query);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        Range: "0-19",
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error("france-travail-search");

    const payload = (await response.json()) as { resultats?: FranceTravailOffer[] };
    for (const raw of payload.resultats ?? []) {
      const offer = toOffer(raw);
      if (offer) offers.push(offer);
    }
  }

  return offers;
}
