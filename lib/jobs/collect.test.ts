import { describe, expect, it } from "vitest";

import { dedupeOffers, queriesFor, rankOffers } from "@/lib/jobs/collect";
import type { JobOffer } from "@/lib/jobs/types";

function offer(overrides: Partial<JobOffer> = {}): JobOffer {
  return {
    id: "1",
    title: "Vendeur",
    company: "Magasin",
    location: "Bordeaux",
    contract: "CDI",
    salary: "",
    description: "Rayon alimentaire",
    url: "https://example.com/a",
    source: "indeed",
    ...overrides,
  };
}

describe("collect", () => {
  it("puts a typed search first and keeps a short list", () => {
    expect(queriesFor("product designer")[0]).toBe("product designer");
    expect(queriesFor("").length).toBe(4);
  });

  it("drops duplicate urls", () => {
    const unique = dedupeOffers([
      offer({ id: "a", url: "https://example.com/job?ref=1" }),
      offer({ id: "b", url: "https://example.com/job?utm=2" }),
    ]);
    expect(unique).toHaveLength(1);
  });

  it("keeps a product designer ahead of an unrelated shop job", () => {
    const ranked = rankOffers(
      [
        offer({
          id: "shop",
          title: "Vendeur",
          description: "Magasin de vêtements",
          url: "https://example.com/shop",
        }),
        offer({
          id: "design",
          title: "Product Designer",
          description: "Figma, marque, produit digital",
          url: "https://example.com/design",
        }),
      ],
      "product designer",
    );
    expect(ranked[0]?.title).toBe("Product Designer");
  });
});
