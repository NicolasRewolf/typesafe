import type { Gap, Judgments, Verdict } from "@/lib/jobs/types";

const GAPS: Gap[] = ["none", "field", "specialist", "seniority", "evidence"];

export function isGap(value: string): value is Gap {
  return GAPS.includes(value as Gap);
}

export function composeVerdict(judgments: Judgments): Verdict {
  if (judgments.dealbreaker >= 0.72) return "non";
  if (judgments.field < 0.38) return "non";

  const isSolid =
    judgments.field >= 0.62 &&
    judgments.skills >= 0.58 &&
    judgments.seniority >= 0.58 &&
    judgments.fit >= 2 &&
    judgments.fitConfidence >= 0.5 &&
    judgments.dealbreaker < 0.35;

  if (isSolid) return "oui";

  const isGray =
    judgments.fitConfidence < 0.5 ||
    (judgments.skills >= 0.28 && judgments.skills < 0.58) ||
    (judgments.seniority >= 0.28 && judgments.seniority < 0.58) ||
    (judgments.fit >= 1 && judgments.fit < 2) ||
    (judgments.dealbreaker >= 0.35 && judgments.dealbreaker < 0.72) ||
    judgments.gap === "evidence";

  if (judgments.field >= 0.38 && isGray) return "a-voir";
  return "non";
}

export function reasonFor(verdict: Verdict, judgments: Judgments): string {
  if (verdict === "oui") {
    if (judgments.gap === "none") return "Le métier, le niveau et l’expérience collent.";
    return "Le poste est crédible pour ce profil.";
  }

  if (judgments.dealbreaker >= 0.72)
    return "Le poste est trop loin, ou une condition bloque.";
  if (judgments.field < 0.38)
    return "Ce n’est pas son métier.";
  if (judgments.gap === "specialist")
    return "Le cœur du poste demande une spécialité trop étroite.";
  if (judgments.gap === "seniority") return "Le niveau du poste ne colle pas.";
  if (judgments.gap === "evidence" || judgments.fitConfidence < 0.45)
    return "L’offre ne dit pas assez pour trancher.";
  if (verdict === "a-voir")
    return "Le métier est dans le champ, le reste reste à vérifier.";
  if (judgments.gap === "field") return "Ce n’est pas son métier.";
  return "Le poste ne colle pas assez.";
}
