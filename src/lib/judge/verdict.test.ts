import { describe, expect, it } from "vitest";

import { composeVerdict, reasonFor } from "@/lib/judge/verdict";
import type { Judgments } from "@/lib/jobs/types";

function judgments(overrides: Partial<Judgments> = {}): Judgments {
  return {
    field: 0.9,
    skills: 0.7,
    seniority: 0.7,
    dealbreaker: 0.1,
    fit: 2.4,
    fitConfidence: 0.7,
    gap: "none",
    ...overrides,
  };
}

describe("composeVerdict", () => {
  it("stamps Non when the dealbreaker is strong", () => {
    expect(composeVerdict(judgments({ dealbreaker: 0.88, field: 0.9 }))).toBe("non");
  });

  it("stamps Non when the field is too low", () => {
    expect(composeVerdict(judgments({ field: 0.2, skills: 0.8 }))).toBe("non");
  });

  it("stamps Oui when skills, seniority, fit and confidence are solid", () => {
    expect(composeVerdict(judgments())).toBe("oui");
  });

  it("stamps À voir when the field matches but skills are still thin", () => {
    expect(
      composeVerdict(
        judgments({
          field: 0.9,
          skills: 0.29,
          seniority: 0.6,
          fit: 1.4,
          fitConfidence: 0.55,
          gap: "specialist",
        }),
      ),
    ).toBe("a-voir");
  });

  it("stamps À voir when score confidence is low", () => {
    expect(composeVerdict(judgments({ fitConfidence: 0.32, fit: 2.1 }))).toBe(
      "a-voir",
    );
  });
});

describe("reasonFor", () => {
  it("uses the typed gap, not generated prose", () => {
    expect(reasonFor("oui", judgments({ gap: "none" }))).toBe(
      "Le métier, le niveau et l’expérience collent.",
    );
    expect(
      reasonFor("non", judgments({ dealbreaker: 0.9, gap: "field" })),
    ).toBe("Le poste est trop loin, ou une condition bloque.");
    expect(
      reasonFor(
        "a-voir",
        judgments({ field: 0.9, skills: 0.29, gap: "specialist" }),
      ),
    ).toBe("Le cœur du poste demande une spécialité trop étroite.");
    expect(
      reasonFor(
        "a-voir",
        judgments({ field: 0.75, skills: 0.19, fitConfidence: 0.37, gap: "field" }),
      ),
    ).toBe("L’offre ne dit pas assez pour trancher.");
  });
});
