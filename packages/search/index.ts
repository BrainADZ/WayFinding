import type { Snapshot, Tenant, Poi } from "../domain";
const synonyms: Record<string, string> = {
  bathroom: "washroom",
  toilet: "washroom",
  restroom: "washroom",
  movie: "cinema",
  movies: "cinema",
  films: "cinema",
  makeup: "cosmetics",
  sneakers: "shoes",
  laptop: "electronics",
  kids: "children",
  cafe: "coffee",
  café: "coffee",
};
const normal = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ");
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++)
      cur[j] = Math.min(
        cur[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    prev = cur;
  }
  return prev[b.length] ?? 0;
}
export interface SearchResult {
  id: string;
  name: string;
  floorId: string;
  nodeId: string;
  category: string;
  clue: string;
  kind: "tenant" | "poi";
  score: number;
}
export function search(
  data: Snapshot,
  query: string,
  categoryId = "",
  floorId = "",
): SearchResult[] {
  const terms = normal(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => synonyms[t] || t);
  const score = (name: string, parts: string[]) => {
    const words = normal(parts.join(" "))
      .split(/\s+/)
      .map((word) => synonyms[word] || word);
    let total = 0;
    for (const term of terms) {
      let best = 0;
      for (const word of words) {
        if (word === term) best = Math.max(best, 10);
        else if (word.startsWith(term)) best = Math.max(best, 7);
        else if (term.length > 3 && distance(word, term) <= 1)
          best = Math.max(best, 4);
      }
      if (!best) return 0;
      total += best;
    }
    if (normal(name) === normal(query)) total += 100;
    return total || 1;
  };
  return [
    ...data.tenants
      .filter(
        (t) =>
          t.status !== "HIDDEN" &&
          (!categoryId || t.categoryId === categoryId) &&
          (!floorId || t.floorId === floorId),
      )
      .map((t: Tenant) => {
        const category =
          data.categories.find((c) => c.id === t.categoryId)?.name || "";
        return {
          id: t.id,
          name: t.name,
          floorId: t.floorId,
          nodeId: t.nodeId,
          category,
          clue: t.productTypes.slice(0, 3).join(" · "),
          kind: "tenant" as const,
          score: score(t.name, [
            t.name,
            t.tradingName,
            category,
            t.subcategory ?? "",
            t.description,
            t.floorId,
            t.unitNumber,
            ...t.keywords,
            ...t.productTypes,
            ...t.services,
          ]),
        };
      }),
    ...data.pois
      .filter(
        (p) =>
          p.status === "ACTIVE" &&
          !categoryId &&
          (!floorId || p.floorId === floorId),
      )
      .map((p: Poi) => ({
        id: p.id,
        name: p.name,
        floorId: p.floorId,
        nodeId: p.nodeId,
        category: "Amenities",
        clue: p.description,
        kind: "poi" as const,
        score: score(p.name, [p.name, p.type, p.description]),
      })),
  ]
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
