export type Vague = "hub" | "vague-1" | "vague-2" | "etagere";

export type SitemapPage = {
  path: string;
  slug: string;
  nom: string;
  famille: string;
  familleNom: string;
  pitch: string;
  note: string;
  vague: Vague;
  questionAchat: string;
  soeurs: string[];
  idees: string[];
};

export type RegleGoogle = {
  id: string;
  ok: boolean;
  mot: string;
};

export type IdeeNotee = {
  texte: string;
  note: number;
  retenu: boolean;
  pourquoi: string;
  regles: RegleGoogle[];
};

export type PageTitres = {
  path: string;
  nom: string;
  famille: string;
  familleNom: string;
  vague: Vague;
  questionAchat: string;
  retenu: string;
  note: number;
  idees: IdeeNotee[];
};

export type ResultatSitemap = {
  pages: PageTitres[];
  commencerPar: string | null;
  typesafe: boolean;
};
