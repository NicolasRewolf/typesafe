import type { Verdict } from "@/lib/jobs/types";

const LABELS: Record<Verdict, string> = {
  oui: "Oui",
  non: "Non",
  "a-voir": "À voir",
};

export function Stamp({ verdict }: { verdict: Verdict }) {
  return (
    <p className={`stamp stamp-${verdict}`} aria-label={`Tampon ${LABELS[verdict]}`}>
      {LABELS[verdict]}
    </p>
  );
}
