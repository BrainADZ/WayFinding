import type { Route, RouteEdge, RouteNode, Floor } from "../domain";
// An admissible graph-derived scale keeps the heuristic correct after map edits.
export function findRoute(
  nodes: RouteNode[],
  edges: RouteEdge[],
  origin: string,
  destination: string,
  accessible = false,
  floors: Floor[] = [],
): Route | null {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  if (!byId.has(origin) || !byId.has(destination)) return null;
  const eligible = edges.filter(
    (e) =>
      e.active &&
      !e.restricted &&
      (!accessible ||
        (e.accessible && !["stairs", "escalator"].includes(e.type))),
  );
  const adjacent = new Map<string, { node: string; edge: RouteEdge }[]>();
  let ratio = Infinity;
  for (const e of eligible) {
    const a = byId.get(e.fromNode),
      b = byId.get(e.toNode);
    if (!a || !b) continue;
    const d = Math.hypot(
      a.x - b.x,
      a.y - b.y,
      (floors.find((f) => f.id === a.floorId)?.level ?? 0) * 100 -
        (floors.find((f) => f.id === b.floorId)?.level ?? 0) * 100,
    );
    if (d) ratio = Math.min(ratio, (e.estimatedTime * e.weight) / d);
    adjacent.set(a.id, [
      ...(adjacent.get(a.id) || []),
      { node: b.id, edge: e },
    ]);
    if (e.direction === "BOTH")
      adjacent.set(b.id, [
        ...(adjacent.get(b.id) || []),
        { node: a.id, edge: e },
      ]);
  }
  if (!Number.isFinite(ratio)) ratio = 0;
  const goal = byId.get(destination)!;
  const heuristic = (id: string) => {
    const n = byId.get(id)!;
    return (
      Math.hypot(
        n.x - goal.x,
        n.y - goal.y,
        ((floors.find((f) => f.id === n.floorId)?.level ?? 0) -
          (floors.find((f) => f.id === goal.floorId)?.level ?? 0)) *
          100,
      ) * ratio
    );
  };
  const open = new Set([origin]),
    cost = new Map([[origin, 0]]),
    previous = new Map<string, { node: string; edge: RouteEdge }>();
  while (open.size) {
    const current = [...open].sort(
      (a, b) =>
        cost.get(a)! + heuristic(a) - (cost.get(b)! + heuristic(b)) ||
        a.localeCompare(b),
    )[0];
    if (current === destination) {
      const resultNodes: RouteNode[] = [goal],
        resultEdges: RouteEdge[] = [];
      let p = destination;
      while (p !== origin) {
        const prev = previous.get(p)!;
        resultEdges.unshift(prev.edge);
        resultNodes.unshift(byId.get(prev.node)!);
        p = prev.node;
      }
      const steps = resultEdges.map((e, i) => {
        const a = resultNodes[i],
          b = resultNodes[i + 1],
          connector = a.floorId !== b.floorId;
        let instruction = `Continue ${Math.round(e.distance)} metres towards ${b.label}.`;
        if (connector)
          instruction = `Take the ${e.type} to ${floors.find((f) => f.id === b.floorId)?.name ?? b.floorId}.`;
        else if (i > 0) {
          const prev = resultNodes[i - 1];
          const cross =
            (a.x - prev.x) * (b.y - a.y) - (a.y - prev.y) * (b.x - a.x);
          if (Math.abs(cross) > 10)
            instruction = `Turn ${cross > 0 ? "right" : "left"} and continue ${Math.round(e.distance)} metres towards ${b.label}.`;
        }
        return {
          text: instruction,
          floorId: b.floorId,
          nodeId: b.id,
          distance: e.distance,
          connector,
        };
      });
      steps.push({
        text: `You have arrived at ${goal.label}.`,
        floorId: goal.floorId,
        nodeId: goal.id,
        distance: 0,
        connector: false,
      });
      return {
        nodes: resultNodes,
        edges: resultEdges,
        distance: Math.round(resultEdges.reduce((s, e) => s + e.distance, 0)),
        minutes: Math.max(
          1,
          Math.ceil(resultEdges.reduce((s, e) => s + e.estimatedTime, 0) / 60),
        ),
        steps,
        floorIds: [...new Set(resultNodes.map((n) => n.floorId))],
      };
    }
    open.delete(current);
    for (const next of adjacent.get(current) || []) {
      const candidate =
        cost.get(current)! + next.edge.estimatedTime * next.edge.weight;
      if (candidate < (cost.get(next.node) ?? Infinity)) {
        cost.set(next.node, candidate);
        previous.set(next.node, { node: current, edge: next.edge });
        open.add(next.node);
      }
    }
  }
  return null;
}
export function validateGraph(nodes: RouteNode[], edges: RouteEdge[]) {
  const issues: string[] = [];
  const ids = new Set(nodes.map((n) => n.id));
  for (const e of edges)
    if (!ids.has(e.fromNode) || !ids.has(e.toNode))
      issues.push(`Edge ${e.id} has a missing endpoint`);
  if (nodes.length) {
    const seen = new Set([nodes[0].id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const e of edges.filter((e) => e.active && !e.restricted)) {
        if (seen.has(e.fromNode) && !seen.has(e.toNode)) {
          seen.add(e.toNode);
          changed = true;
        }
        if (
          e.direction === "BOTH" &&
          seen.has(e.toNode) &&
          !seen.has(e.fromNode)
        ) {
          seen.add(e.fromNode);
          changed = true;
        }
      }
    }
    if (seen.size < nodes.length)
      issues.push(
        `${nodes.length - seen.size} nodes cannot be reached from ${nodes[0].label}`,
      );
  }
  return issues;
}
