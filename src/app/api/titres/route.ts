import { chargerPages } from "@/lib/arbre";
import { noterSitemap } from "@/lib/choisir";

export const maxDuration = 120;

export async function GET() {
  const pages = chargerPages();
  return Response.json({
    pages: pages.map((p) => ({
      path: p.path,
      nom: p.nom,
      famille: p.famille,
      familleNom: p.familleNom,
      vague: p.vague,
      questionAchat: p.questionAchat,
      idees: p.idees,
    })),
  });
}

export async function POST() {
  try {
    const pages = chargerPages();
    const resultat = await noterSitemap(pages);
    return Response.json(resultat);
  } catch {
    return Response.json(
      { erreur: "On n’a pas pu noter les titres. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
