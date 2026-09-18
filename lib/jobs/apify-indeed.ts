import { stripHtml, truncate } from "@/lib/jobs/text";
import type { JobOffer } from "@/lib/jobs/types";

const ACTOR =
  "https://api.apify.com/v2/acts/misceres~indeed-scraper/run-sync-get-dataset-items";

interface IndeedItem {
  id?: string;
  positionName?: string;
  company?: string;
  location?: string;
  salary?: string | null;
  jobType?: string | string[] | null;
  description?: string;
  url?: string;
}

function jobTypeLabel(value: IndeedItem["jobType"]): string {
  if (!value) return "";
  return Array.isArray(value) ? value.filter(Boolean).join(" · ") : value;
}

function toOffer(raw: IndeedItem): JobOffer | null {
  const title = raw.positionName?.trim();
  const url = raw.url?.trim();
  if (!title || !url) return null;

  const id = raw.id?.trim() || url;
  return {
    id: `indeed-${id}`,
    title,
    company: raw.company?.trim() || "Entreprise non nommée",
    location: raw.location?.trim() || "Bordeaux",
    contract: jobTypeLabel(raw.jobType),
    salary: raw.salary?.trim() || "",
    description: truncate(stripHtml(raw.description ?? "")),
    url,
    source: "indeed",
  };
}

function startUrl(query: string): { url: string } {
  const params = new URLSearchParams({ q: query, l: "Bordeaux" });
  return { url: `https://fr.indeed.com/jobs?${params.toString()}` };
}

async function runActor(token: string, body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${ACTOR}?timeout=180`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(190_000),
  });

  if (!response.ok) throw new Error("indeed-search");
  return response.json();
}

function offersFrom(payload: unknown): JobOffer[] {
  if (!Array.isArray(payload)) throw new Error("indeed-search");
  const offers: JobOffer[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    if ("error" in item) continue;
    const offer = toOffer(item as IndeedItem);
    if (offer) offers.push(offer);
  }
  return offers;
}

async function searchByCountry(token: string, queries: string[]): Promise<JobOffer[]> {
  const offers: JobOffer[] = [];
  for (let index = 0; index < queries.length; index += 2) {
    const slice = queries.slice(index, index + 2);
    const batches = await Promise.all(
      slice.map((position) =>
        runActor(token, {
          country: "FR",
          location: "Bordeaux",
          position,
          maxItemsPerSearch: 8,
          saveOnlyUniqueItems: true,
        }),
      ),
    );
    offers.push(...batches.flatMap(offersFrom));
  }
  return offers;
}

async function searchByStartUrls(token: string, queries: string[]): Promise<JobOffer[]> {
  return offersFrom(
    await runActor(token, {
      startUrls: queries.map(startUrl),
      maxItemsPerSearch: 8,
      saveOnlyUniqueItems: true,
    }),
  );
}

export async function searchIndeed(queries: string[]): Promise<JobOffer[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return [];

  const uniqueQueries = [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
  if (uniqueQueries.length === 0) return [];

  try {
    const byCountry = await searchByCountry(token, uniqueQueries);
    if (byCountry.length) return byCountry;
  } catch {
    // France as a country code can fail; the French Indeed URLs are the fallback.
  }

  return searchByStartUrls(token, uniqueQueries);
}
