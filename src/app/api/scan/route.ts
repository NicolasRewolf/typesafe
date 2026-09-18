import { clipText } from "@/lib/jobs/text";
import { scanOffers } from "@/lib/judge/scan";
import { DEFAULT_PROFILE, type Profile } from "@/lib/profile";
import { scanMessage } from "@/lib/scan-errors";

export const maxDuration = 300;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readProfile(value: unknown): Profile {
  const incoming = value && typeof value === "object" ? (value as Profile) : DEFAULT_PROFILE;
  return {
    name: clipText(incoming.name, 80) || DEFAULT_PROFILE.name,
    headline: clipText(incoming.headline, 240) || DEFAULT_PROFILE.headline,
    practice: clipText(incoming.practice, 600) || DEFAULT_PROFILE.practice,
    notThis: clipText(incoming.notThis, 400) || DEFAULT_PROFILE.notThis,
    evidence: clipText(incoming.evidence, 800) || DEFAULT_PROFILE.evidence,
    tools: clipText(incoming.tools, 400) || DEFAULT_PROFILE.tools,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: unknown;
      lookingFor?: unknown;
    };
    const result = await scanOffers(readProfile(body.profile), clipText(body.lookingFor, 120));
    return Response.json(result);
  } catch (error) {
    const message = scanMessage(error);
    const status =
      error instanceof Error && error.message === "missing-source" ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}
