import { describe, expect, it } from "vitest";

import {
  DEFAULT_INDEED_POSITION,
  indeedPosition,
  offersFrom,
} from "@/lib/jobs/apify-indeed";

describe("indeedPosition", () => {
  it("uses the typed search as the only Indeed position", () => {
    expect(indeedPosition("  product designer  ")).toBe("product designer");
  });

  it("combines the default trades when the field is empty", () => {
    expect(indeedPosition("")).toBe(DEFAULT_INDEED_POSITION);
    expect(indeedPosition("   ")).toBe(DEFAULT_INDEED_POSITION);
    expect(DEFAULT_INDEED_POSITION).toContain('"product designer"');
    expect(DEFAULT_INDEED_POSITION).toContain(" OR ");
  });
});

describe("offersFrom", () => {
  it("maps Indeed items and drops errors", () => {
    const offers = offersFrom([
      {
        id: "1",
        positionName: "Product Designer",
        company: "Studio",
        location: "Bordeaux",
        url: "https://fr.indeed.com/viewjob?jk=1",
        description: "<p>Figma</p>",
      },
      { error: "rate-limit" },
      { positionName: "Sans lien" },
    ]);
    expect(offers).toHaveLength(1);
    expect(offers[0]?.title).toBe("Product Designer");
    expect(offers[0]?.url).toContain("indeed.com");
  });

  it("treats a non-array payload as zero offers", () => {
    expect(offersFrom({ error: { type: "rate-limit" } })).toEqual([]);
    expect(offersFrom(null)).toEqual([]);
  });
});
