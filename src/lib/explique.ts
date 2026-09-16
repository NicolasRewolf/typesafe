import type { IdeeNotee, RegleGoogle } from "@/lib/types";

function plusFaible(regles: RegleGoogle[]): RegleGoogle | undefined {
  return regles.find((r) => !r.ok);
}

export function expliquer(
  idee: string,
  note: number,
  retenu: boolean,
  regles: RegleGoogle[],
  typesafeOk: boolean,
): string {
  const souci = plusFaible(regles);
  if (retenu && note >= 8) {
    return typesafeOk
      ? "C’est celui qui décrit le mieux la page, sans être trop long ni trop chargé."
      : "C’est le plus clair et le plus court parmi les idées de cette page.";
  }
  if (retenu && souci) {
    return `On le retient, avec une réserve : ${souci.mot}`;
  }
  if (souci) return souci.mot;
  if (note >= 7) return `Solide. ${idee.includes("Rewolf") ? "Le nom du studio est déjà à sa place." : ""}`.trim();
  return "Passable, mais un autre titre de cette page est plus net.";
}

export function etiquterVague(vague: string): string | null {
  if (vague === "etagere") return "Pas maintenant";
  if (vague === "vague-1") return "À écrire en premier";
  if (vague === "hub") return "Porte";
  return null;
}

export function noteSurDix(valeur: number): string {
  const arrondi = Math.round(valeur * 10) / 10;
  const montre = Number.isInteger(arrondi) ? String(arrondi) : arrondi.toFixed(1);
  return `${montre} / 10`;
}

export function ideeRetenue(idees: IdeeNotee[]): IdeeNotee {
  return idees.find((i) => i.retenu) ?? idees[0];
}
