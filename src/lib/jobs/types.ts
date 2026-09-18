export type JobSource = "france-travail" | "indeed";

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  contract: string;
  salary: string;
  description: string;
  url: string;
  source: JobSource;
}

export type Verdict = "oui" | "non" | "a-voir";

export type Gap = "none" | "field" | "specialist" | "seniority" | "evidence";

export interface Judgments {
  field: number;
  skills: number;
  seniority: number;
  dealbreaker: number;
  fit: number;
  fitConfidence: number;
  gap: Gap;
}

export interface StampedOffer {
  offer: JobOffer;
  verdict: Verdict;
  reason: string;
  judgments: Judgments;
}

export interface ScanResult {
  sourceLabel: string;
  offers: StampedOffer[];
}
