import { searchIndeed } from "@/lib/jobs/apify-indeed";
import { searchFranceTravail } from "@/lib/jobs/france-travail";
import type { JobOffer } from "@/lib/jobs/types";

export const DEFAULT_QUERIES = [
  "product designer",
  "chef de projet digital",
  "directeur artistique",
  "product manager",
  "consultant digital",
  "growth SEO",
  "wix framer",
  "intelligence artificielle",
];

const KEYWORDS = [
  "design",
  "designer",
  "produit",
  "product",
  "marque",
  "brand",
  "artistique",
  "digital",
  "numerique",
  "numérique",
  "seo",
  "growth",
  "ia",
  "intelligence",
  "wix",
  "framer",
  "figma",
  "consultant",
  "projet",
  "direction",
  "communication",
  "web",
  "cms",
];

const TARGET_COUNT = 20;
const STRONG_SLOTS = 16;

export function queriesFor(lookingFor: string): string[] {
  const typed = lookingFor.trim();
  if (typed) return [typed, ...DEFAULT_QUERIES.filter((query) => query !== typed)].slice(0, 4);
  return DEFAULT_QUERIES.slice(0, 4);
}

const TRACKING_PARAM = /^(utm|ref|fccid|from|fromjk|tk|xkcb)/i;

export function offerKey(offer: JobOffer): string {
  if (!offer.url) return `${offer.title}|${offer.company}`.toLowerCase();

  try {
    const parsed = new URL(offer.url);
    const jobId = parsed.searchParams.get("jk") || parsed.searchParams.get("vjk");
    if (jobId)
      return `${parsed.origin}${parsed.pathname}?jk=${jobId}`.toLowerCase();

    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAM.test(key)) parsed.searchParams.delete(key);
    }
    return parsed.toString().toLowerCase();
  } catch {
    return offer.url.replace(/#.*$/, "").toLowerCase();
  }
}

export function dedupeOffers(offers: JobOffer[]): JobOffer[] {
  const seen = new Set<string>();
  const unique: JobOffer[] = [];
  for (const offer of offers) {
    const key = offerKey(offer);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(offer);
  }
  return unique;
}

function tokensFor(lookingFor: string): string[] {
  const extra = lookingFor
    .toLowerCase()
    .split(/[^a-zàâäéèêëïîôùûüç0-9+]+/i)
    .filter((token) => token.length >= 3);
  return [...new Set([...KEYWORDS, ...extra])];
}

export function rankOffers(offers: JobOffer[], lookingFor: string): JobOffer[] {
  const tokens = tokensFor(lookingFor);
  const scored = [...offers]
    .map((offer) => {
      const haystack = `${offer.title} ${offer.description}`.toLowerCase();
      const score = tokens.reduce(
        (total, token) => total + (haystack.includes(token) ? 1 : 0),
        0,
      );
      return { offer, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored.length <= TARGET_COUNT)
    return scored.map((entry) => entry.offer);

  const strong = scored.slice(0, STRONG_SLOTS);
  const leftover = scored.slice(STRONG_SLOTS);
  const fillers = leftover
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, TARGET_COUNT - strong.length);

  return [...strong, ...fillers].map((entry) => entry.offer);
}

export async function collectOffers(lookingFor: string): Promise<{
  offers: JobOffer[];
  sourceLabel: string;
}> {
  const queries = queriesFor(lookingFor);
  const hasFranceTravail = Boolean(
    process.env.FT_CLIENT_ID && process.env.FT_CLIENT_SECRET,
  );
  const hasIndeed = Boolean(process.env.APIFY_TOKEN);

  if (!hasFranceTravail && !hasIndeed) throw new Error("missing-source");

  const batches: JobOffer[] = [];
  const labels: string[] = [];
  const failures: string[] = [];

  if (hasFranceTravail) {
    try {
      const fromFranceTravail = await searchFranceTravail(queries);
      batches.push(...fromFranceTravail);
      if (fromFranceTravail.length) labels.push("France Travail");
    } catch {
      failures.push("france-travail");
    }
  }

  if (hasIndeed) {
    try {
      const fromIndeed = await searchIndeed(lookingFor);
      batches.push(...fromIndeed);
      if (fromIndeed.length) labels.push("Indeed");
    } catch {
      failures.push("indeed");
    }
  }

  const offers = rankOffers(dedupeOffers(batches), lookingFor);
  if (offers.length === 0) {
    if (failures.length && !labels.length) throw new Error("source-failed");
    throw new Error("no-offers");
  }

  return {
    offers,
    sourceLabel: labels.join(" et ") || "Bordeaux",
  };
}
