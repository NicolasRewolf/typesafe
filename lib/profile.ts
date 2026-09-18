export interface Profile {
  name: string;
  headline: string;
  practice: string;
  notThis: string;
  evidence: string;
  tools: string;
}

export const DEFAULT_PROFILE: Profile = {
  name: "Nicolas Doucet",
  headline: "Consultant hybride · Marque, IA & numérique. Cofondateur de REWOLF, Bordeaux.",
  practice:
    "Marque et direction artistique, sites et CMS, produit digital, IA assistée, SEO et mesure, conduite de projet jusqu’à la livraison.",
  notThis:
    "Pas ingénieur logiciel staff, pas mécanicien CAD au quotidien, pas vente en magasin, pas métier industriel pur.",
  evidence:
    "Plouton (Wix, SEO), Cooked, Clear, Pattern, Musée du Vin, Dassault (scénographie), Chaff, KSB/TRIODIS (socle ingénieur historique). Ingénieur EI CESI, MBA ICART. Français natif, anglais pro.",
  tools: "Figma, Framer, Wix, TypeScript, Vercel, Supabase, Google Search Console, Cursor, TypeSafe.",
};

export function profileForState(profile: Profile, lookingFor: string) {
  return {
    name: profile.name,
    headline: profile.headline,
    field: profile.practice,
    notThis: profile.notThis,
    evidence: profile.evidence,
    tools: profile.tools,
    lookingFor,
    location: "Bordeaux, France",
  };
}
