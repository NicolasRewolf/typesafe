import type { StampedOffer } from "@/lib/jobs/types";

import { Stamp } from "@/components/stamp";

export function JobFiche({ item }: { item: StampedOffer }) {
  const { offer } = item;
  const details = [offer.company, offer.location, offer.contract, offer.salary]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="fiche job-fiche">
      <header>
        <div>
          <p className="kicker">{offer.source === "france-travail" ? "France Travail" : "Indeed"}</p>
          <h2>{offer.title}</h2>
        </div>
        <Stamp verdict={item.verdict} />
      </header>
      <p className="meta">{details}</p>
      <p className="reason">{item.reason}</p>
      <a className="open-offer" href={offer.url} target="_blank" rel="noreferrer">
        Ouvrir l’offre
      </a>
    </article>
  );
}
