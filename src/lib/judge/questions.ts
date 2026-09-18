import { choice, noul, score, type Questions } from "@typesafe-ai/sdk";

const OFFER_KEYS = ["a", "b", "c", "d"] as const;

export const BATCH_SIZE = OFFER_KEYS.length;

export function batchKey(index: number): string {
  return OFFER_KEYS[index] ?? `o${index}`;
}

export function questionsForBatch(count: number): Questions {
  const questions: Questions = {};

  for (let index = 0; index < count; index += 1) {
    const key = batchKey(index);
    const offer = `offers.${key}`;

    questions[`${key}_field`] = noul(
      `Given \`profile.field\` and \`profile.notThis\`, is \`${offer}\` a role in the candidate's current field (brand, art direction, digital product, AI-assisted work, growth/SEO, or hybrid founder-consultant direction)?`,
      {
        true: "The job's core occupation sits inside that field, even if the company or tools differ.",
        false:
          "The job is a different occupation: software-engineering IC, industrial CAD as daily practice, retail sales, a regulated practice, or otherwise outside that field.",
      },
    );

    questions[`${key}_skills`] = noul(
      `Does \`profile.evidence\` plus \`profile.tools\` cover the CORE of \`${offer}\`? Ignore nice-to-haves.`,
      {
        true: "The candidate has done the essential work of this job, not merely adjacent work.",
        false: "The core of this job needs skills or depth the profile does not show.",
      },
    );

    questions[`${key}_seniority`] = noul(
      `Is \`${offer}\` compatible with a hybrid founder-consultant described in \`profile\` — not a junior executor, and not a staff backend IC?`,
      {
        true: "The level, autonomy, and scope fit a consultant-founder who leads and delivers.",
        false: "The role is too junior, too execution-only, or a deep specialist IC track.",
      },
    );

    questions[`${key}_dealbreaker`] = noul(
      `Is there a hard mismatch between \`${offer}\` and \`profile\`?`,
      {
        true:
          "Regulated profession, unrelated occupation, missing required licence or degree, or industrial CAD as the current daily practice.",
        false: "No hard blocker. Remaining gaps are about fit, skills, or seniority.",
      },
    );

    questions[`${key}_fit`] = score(
      `How strong is the overall fit of \`${offer}\` for \`profile\` as a next role in Bordeaux?`,
      [
        "Unrelated: different occupation or a hard mismatch.",
        "Adjacent: same broad creative or digital world, but a stretch or a different specialty.",
        "Credible: a hybrid brand, digital, and AI consultant-founder could do the core of this job.",
        "Strong: the core work maps closely to current practice and evidence.",
      ],
    );

    questions[`${key}_gap`] = choice(
      `If \`${offer}\` is not a clear yes for \`profile\`, what is the main gap?`,
      {
        none: "No material gap. This is a credible or strong match.",
        field: "The occupation itself is outside the candidate's field.",
        specialist:
          "The core needs a specialist skill the profile does not cover as current practice.",
        seniority: "The level is too junior, too IC-staff, or otherwise incompatible.",
        evidence: "The posting is too thin to judge the core of the job.",
      },
    );
  }

  return questions;
}
