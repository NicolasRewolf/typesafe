const MAX_DESCRIPTION = 1600;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
      const named = ENTITIES[entity.toLowerCase()];
      if (named) return named;
      if (entity.startsWith("#x") || entity.startsWith("#X"))
        return String.fromCharCode(Number.parseInt(entity.slice(2), 16));
      if (entity.startsWith("#"))
        return String.fromCharCode(Number.parseInt(entity.slice(1), 10));
      return " ";
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(value: string, max = MAX_DESCRIPTION): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trimEnd()}…`;
}

export function clipText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max).trim();
}
