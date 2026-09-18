import { stripHtml, truncate } from "@/lib/jobs/text";
import type { JobOffer } from "@/lib/jobs/types";

const ACTOR =
  "https://api.apify.com/v2/acts/misceres~indeed-scraper/run-sync-get-dataset-items";

export const DEFAULT_INDEED_POSITION =
  '"product designer" OR "directeur artistique" OR "product manager" OR "consultant digital"';

const MAX_ITEMS = 20;

interface IndeedItem {
  id?: string;
  positionName?: string;
  company?: string;
  location?: string;
  salary?: string | null;
  jobType?: string | string[] | null;
  description?: string;
  url?: string;
  error?: string;
}

function jobTypeLabel(value: IndeedItem["jobType"]): string {
  if (!value) return "";
  return Array.isArray(value) ? value.filter(Boolean).join(" · ") : value;
}

function toOffer(raw: IndeedItem): JobOffer | null {
  if (raw.error) return null;
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

export function indeedPosition(lookingFor: string): string {
  return lookingFor.trim() || DEFAULT_INDEED_POSITION;
}

function startUrl(position: string): { url: string } {
  const params = new URLSearchParams({ q: position, l: "Bordeaux" });
  return { url: `https://fr.indeed.com/jobs?${params.toString()}` };
}

function itemsFrom(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  return [];
}

export function offersFrom(payload: unknown): JobOffer[] {
  const offers: JobOffer[] = [];
  for (const item of itemsFrom(payload)) {
    if (!item || typeof item !== "object") continue;
    const offer = toOffer(item as IndeedItem);
    if (offer) offers.push(offer);
  }
  return offers;
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

function countrySearchBody(position: string): Record<string, unknown> {
  return {
    country: "FR",
    location: "Bordeaux",
    position,
    maxItemsPerSearch: MAX_ITEMS,
    saveOnlyUniqueItems: true,
  };
}

function startUrlsBody(position: string): Record<string, unknown> {
  return {
    startUrls: [startUrl(position)],
    maxItemsPerSearch: MAX_ITEMS,
    saveOnlyUniqueItems: true,
  };
}

export async function searchIndeed(lookingFor: string): Promise<JobOffer[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return [];

  const position = indeedPosition(lookingFor);

  try {
    const offers = offersFrom(await runActor(token, countrySearchBody(position)));
    if (offers.length) return offers;
  } catch {
    // Fallback below: a single startUrls run.
  }

  try {
    return offersFrom(await runActor(token, startUrlsBody(position)));
  } catch {
    throw new Error("indeed-search");
  }
}
