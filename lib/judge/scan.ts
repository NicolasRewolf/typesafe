import "server-only";

import type { Profile } from "@/lib/profile";
import { profileForState } from "@/lib/profile";
import { collectOffers } from "@/lib/jobs/collect";
import type { JobOffer, Judgments, StampedOffer } from "@/lib/jobs/types";
import { typesafeClient } from "@/lib/judge/client";
import { BATCH_SIZE, batchKey, questionsForBatch } from "@/lib/judge/questions";
import { composeVerdict, isGap, reasonFor } from "@/lib/judge/verdict";

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size)
    groups.push(items.slice(index, index + size));
  return groups;
}

function readNoul(answers: Record<string, unknown>, id: string): number {
  const answer = answers[id] as { type?: string; noul?: number } | undefined;
  if (answer?.type !== "noul" || typeof answer.noul !== "number")
    throw new Error("judge-shape");
  return answer.noul;
}

function readScore(answers: Record<string, unknown>, id: string): {
  score: number;
  confidence: number;
} {
  const answer = answers[id] as
    | { type?: string; score?: number; confidence?: number }
    | undefined;
  if (
    answer?.type !== "score" ||
    typeof answer.score !== "number" ||
    typeof answer.confidence !== "number"
  )
    throw new Error("judge-shape");
  return { score: answer.score, confidence: answer.confidence };
}

function readGap(answers: Record<string, unknown>, id: string): Judgments["gap"] {
  const answer = answers[id] as { type?: string; choice?: string } | undefined;
  if (answer?.type !== "choice" || !answer.choice || !isGap(answer.choice))
    throw new Error("judge-shape");
  return answer.choice;
}

function judgmentsFor(answers: Record<string, unknown>, key: string): Judgments {
  const fit = readScore(answers, `${key}_fit`);
  return {
    field: readNoul(answers, `${key}_field`),
    skills: readNoul(answers, `${key}_skills`),
    seniority: readNoul(answers, `${key}_seniority`),
    dealbreaker: readNoul(answers, `${key}_dealbreaker`),
    fit: fit.score,
    fitConfidence: fit.confidence,
    gap: readGap(answers, `${key}_gap`),
  };
}

async function stampBatch(
  profile: Profile,
  lookingFor: string,
  offers: JobOffer[],
): Promise<StampedOffer[]> {
  const offersState = Object.fromEntries(
    offers.map((offer, index) => [
      batchKey(index),
      {
        title: offer.title,
        company: offer.company,
        location: offer.location,
        contract: offer.contract,
        salary: offer.salary,
        description: offer.description,
      },
    ]),
  );

  const response = await typesafeClient().systemOne({
    model: "jev-latest",
    state: {
      profile: profileForState(profile, lookingFor),
      offers: offersState,
    },
    questions: questionsForBatch(offers.length),
  });

  const answers = response.answers as Record<string, unknown>;
  return offers.map((offer, index) => {
    const judgments = judgmentsFor(answers, batchKey(index));
    const verdict = composeVerdict(judgments);
    return {
      offer,
      verdict,
      reason: reasonFor(verdict, judgments),
      judgments,
    };
  });
}

export async function scanOffers(profile: Profile, lookingFor: string) {
  const collected = await collectOffers(lookingFor);
  const stamped: StampedOffer[] = [];

  for (const group of chunk(collected.offers, BATCH_SIZE))
    stamped.push(...(await stampBatch(profile, lookingFor, group)));

  const order = { oui: 0, "a-voir": 1, non: 2 } as const;
  stamped.sort((left, right) => order[left.verdict] - order[right.verdict]);

  return {
    sourceLabel: collected.sourceLabel,
    offers: stamped,
  };
}
