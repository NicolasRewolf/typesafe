import type { Vague } from "@/lib/types";

export type RecettePage = {
  vague: Vague;
  questionAchat: string;
  soeurs: string[];
};

/** Ordre de bataille : on unique les titres dans cet ordre. */
export const ORDRE_BATTAILLE = [
  "/strategie/plateforme-de-marque",
  "/creation/packaging",
  "/creation/identite-visuelle",
  "/image-son/photographie",
  "/strategie/architecture-de-marque",
  "/creation/print",
  "/digital/growth",
  "/digital/ux-ui",
  "/digital/sites-web",
  "/contenu/copywriting",
  "/digital/seo",
  "/creation/iconographie",
  "/creation/direction-artistique",
  "/creation/scenographie",
  "/creation/presentations",
  "/image-son/direction-shooting",
  "/image-son/branding-sonore",
  "/digital/mesure",
  "/contenu/editorial-seo",
  "/contenu/brand-content",
  "/digital/applications",
  "/strategie",
  "/creation",
  "/image-son",
  "/digital",
  "/contenu",
  "/strategie/positionnement",
  "/strategie/naming",
  "/strategie/ton-de-voix",
  "/strategie/brand-book",
] as const;

export const RECETTE: Record<string, RecettePage> = {
  "/strategie": {
    vague: "hub",
    questionAchat: "Vous posez le socle avant de dessiner ?",
    soeurs: ["/creation", "/contenu"],
  },
  "/strategie/positionnement": {
    vague: "etagere",
    questionAchat: "Vous aidez à choisir un marché, pas seulement à écrire le document ?",
    soeurs: ["/strategie/plateforme-de-marque"],
  },
  "/strategie/plateforme-de-marque": {
    vague: "vague-1",
    questionAchat: "Vous écrivez le document, puis vous l’appliquez ?",
    soeurs: ["/strategie/architecture-de-marque", "/creation/identite-visuelle"],
  },
  "/strategie/naming": {
    vague: "etagere",
    questionAchat: "Vous trouvez le nom d’une marque ?",
    soeurs: ["/strategie/plateforme-de-marque", "/contenu/copywriting"],
  },
  "/strategie/architecture-de-marque": {
    vague: "vague-1",
    questionAchat: "Une marque, plusieurs marchés ?",
    soeurs: ["/strategie/plateforme-de-marque", "/creation/identite-visuelle"],
  },
  "/strategie/ton-de-voix": {
    vague: "etagere",
    questionAchat: "Vous tenez le ton d’une marque ?",
    soeurs: ["/contenu/copywriting"],
  },
  "/strategie/brand-book": {
    vague: "etagere",
    questionAchat: "Vous livrez un brand book après le vécu ?",
    soeurs: ["/strategie/plateforme-de-marque", "/creation/identite-visuelle"],
  },
  "/creation": {
    vague: "hub",
    questionAchat: "Vous faites ce qu’on voit et ce qu’on touche ?",
    soeurs: ["/strategie", "/image-son"],
  },
  "/creation/identite-visuelle": {
    vague: "vague-1",
    questionAchat:
      "Vous modernisez une maison installée sans la faire ressembler à une startup ?",
    soeurs: ["/creation/packaging", "/creation/print", "/creation/scenographie"],
  },
  "/creation/direction-artistique": {
    vague: "vague-2",
    questionAchat: "Vous tenez le territoire quand la charte est déjà là ?",
    soeurs: ["/creation/identite-visuelle", "/creation/iconographie"],
  },
  "/creation/iconographie": {
    vague: "vague-2",
    questionAchat: "Pictos, estampe, gravure — pas le logo ?",
    soeurs: ["/creation/identite-visuelle", "/creation/packaging"],
  },
  "/creation/packaging": {
    vague: "vague-1",
    questionAchat: "Vous allez jusqu’à l’usine ?",
    soeurs: ["/creation/print", "/image-son/photographie", "/creation/identite-visuelle"],
  },
  "/creation/print": {
    vague: "vague-1",
    questionAchat: "BAT, PLV, jusqu’à l’imprimeur ?",
    soeurs: ["/creation/packaging", "/creation/identite-visuelle", "/creation/scenographie"],
  },
  "/creation/presentations": {
    vague: "vague-2",
    questionAchat: "De Figma au PowerPoint d’entreprise ?",
    soeurs: ["/creation/identite-visuelle", "/contenu/copywriting"],
  },
  "/creation/scenographie": {
    vague: "vague-2",
    questionAchat: "Vous travaillez l’espace : façade, stand, plaque ?",
    soeurs: ["/creation/identite-visuelle", "/creation/print"],
  },
  "/image-son": {
    vague: "hub",
    questionAchat: "Photo de marque, shooting, son ?",
    soeurs: ["/creation", "/digital"],
  },
  "/image-son/photographie": {
    vague: "vague-1",
    questionAchat: "Packshot, lifestyle, reportage — qui dirige ?",
    soeurs: [
      "/image-son/direction-shooting",
      "/creation/packaging",
      "/digital/growth",
    ],
  },
  "/image-son/direction-shooting": {
    vague: "vague-2",
    questionAchat: "Vous préparez casting, looks et lieu ?",
    soeurs: ["/image-son/photographie"],
  },
  "/image-son/branding-sonore": {
    vague: "vague-2",
    questionAchat: "Scoring et voix de marque ?",
    soeurs: ["/image-son/photographie"],
  },
  "/digital": {
    vague: "hub",
    questionAchat: "Un site qui charge, se trouve, et sert ?",
    soeurs: ["/contenu", "/image-son"],
  },
  "/digital/ux-ui": {
    vague: "vague-1",
    questionAchat: "Le parcours, pas seulement un joli site ?",
    soeurs: ["/digital/sites-web", "/contenu/copywriting"],
  },
  "/digital/sites-web": {
    vague: "vague-2",
    questionAchat: "Un site de marque, transféré au client ?",
    soeurs: ["/digital/ux-ui", "/digital/seo", "/digital/growth"],
  },
  "/digital/seo": {
    vague: "vague-2",
    questionAchat: "Domaine, indexation, Search Console ?",
    soeurs: ["/digital/sites-web", "/contenu/editorial-seo"],
  },
  "/digital/growth": {
    vague: "vague-1",
    questionAchat: "Ads, KissKiss, Google — pas seulement du posting ?",
    soeurs: ["/image-son/photographie", "/digital/sites-web", "/digital/mesure"],
  },
  "/digital/mesure": {
    vague: "vague-2",
    questionAchat: "D’où viennent les clients, sans bandeau ?",
    soeurs: ["/digital/growth", "/digital/seo"],
  },
  "/digital/applications": {
    vague: "vague-2",
    questionAchat: "Vous faites une app, pas un site ?",
    soeurs: ["/digital/sites-web"],
  },
  "/contenu": {
    vague: "hub",
    questionAchat: "Les mots des pages, alignés au ton ?",
    soeurs: ["/strategie", "/digital"],
  },
  "/contenu/copywriting": {
    vague: "vague-2",
    questionAchat: "Les mots des pages, offres, B2B — pas les articles ?",
    soeurs: ["/contenu/editorial-seo", "/creation/presentations"],
  },
  "/contenu/editorial-seo": {
    vague: "vague-2",
    questionAchat: "Titles, meta, articles utiles ?",
    soeurs: ["/contenu/copywriting", "/digital/seo"],
  },
  "/contenu/brand-content": {
    vague: "vague-2",
    questionAchat: "Une pièce unique, pas un article ?",
    soeurs: ["/contenu/copywriting", "/image-son/photographie"],
  },
};
