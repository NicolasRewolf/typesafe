const MESSAGES: Record<string, string> = {
  "missing-judge": "Le tampon n’est pas branché. Il manque une clé côté serveur.",
  "missing-source":
    "Pour aller chercher les offres, il faut une clé France Travail ou Apify.",
  "source-failed": "La recherche d’offres a échoué. Relance le scan.",
  "no-offers": "Aucune offre trouvée à Bordeaux pour cette recherche.",
  "judge-shape": "Le tampon a renvoyé une réponse inattendue. Relance le scan.",
  "france-travail-token": "France Travail n’a pas donné accès. Vérifie les clés.",
  "france-travail-search": "France Travail n’a pas renvoyé les offres.",
  "indeed-search": "Indeed a pris trop de temps, ou n’a pas répondu.",
};

export function scanMessage(error: unknown): string {
  if (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "APITimeoutError")
  )
    return "La recherche a pris trop de temps. Relance le scan.";
  if (error instanceof Error && MESSAGES[error.message])
    return MESSAGES[error.message];
  return "Le scan n’a pas abouti. Relance-le dans un instant.";
}
