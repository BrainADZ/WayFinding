import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { demo } from "../packages/domain/seed";
import { findRoute, validateGraph } from "../packages/routing";
import { search } from "../packages/search";
import { playlist, idleTransition } from "../packages/advertising";
import { upperStores } from "../components/wayfinding/upper-floor-layout";
import {
  createReferenceSnapshot,
  referenceStores,
} from "../components/wayfinding/reference-layout";
describe("BrainADZ Way domain", () => {
  it("routes to upper-floor stores and uses only lifts for accessible floor changes", () => {
    const data = createReferenceSnapshot(demo);
    assert.deepEqual(validateGraph(data.nodes, data.edges), []);
    for (const store of upperStores) {
      const route = findRoute(
        data.nodes,
        data.edges,
        "n-g-start",
        `ref-${store.id}`,
        true,
        data.floors,
      );
      assert.ok(route, store.name);
      assert.equal(route.nodes.at(-1)?.floorId, store.floorId);
      assert.ok(route.edges.some((edge) => edge.type === "lift"));
      assert.ok(
        route.edges.every(
          (edge) => !["stairs", "escalator"].includes(edge.type),
        ),
      );
      assert.ok(
        search(data, store.name).some(
          (result) => result.id === `ref-${store.id}`,
        ),
      );
    }
    for (const type of ["lift", "escalator", "stairs"]) {
      assert.ok(
        data.edges.some(
          (edge) =>
            edge.type === type &&
            edge.fromNode.startsWith("n-l2-") &&
            edge.toNode.startsWith("n-l3-"),
        ),
      );
    }
    for (const floorId of ["l1", "l2", "l3"]) {
      assert.ok(
        upperStores.filter((store) => store.floorId === floorId).length >= 40,
      );
      assert.ok(
        data.tenants.filter((tenant) => tenant.floorId === floorId).length >=
          40,
      );
    }
  });
  it("connects every reference store without mutating the original snapshot", () => {
    const original = JSON.stringify(demo);
    const data = createReferenceSnapshot(demo);
    assert.equal(JSON.stringify(demo), original);
    assert.deepEqual(validateGraph(data.nodes, data.edges), []);
    for (const store of referenceStores) {
      const id = `ref-${store.id}`;
      assert.ok(search(data, store.name).some((result) => result.id === id));
      assert.ok(data.features.some((feature) => feature.id === id));
      const route = findRoute(
        data.nodes,
        data.edges,
        "n-g-start",
        id,
        true,
        data.floors,
      );
      assert.ok(route);
      assert.equal(route.nodes.at(-1)?.id, id);
      assert.deepEqual(route.floorIds, ["g"]);
    }
  });
  it("calculates a same-floor path", () => {
    const r = findRoute(
      demo.nodes,
      demo.edges,
      "n-g-start",
      "n-g-oliva",
      false,
      demo.floors,
    );
    assert.equal(r?.distance, 200);
    assert.deepEqual(r?.floorIds, ["g"]);
  });
  it("calculates an accessible multi-floor path via lift", () => {
    const r = findRoute(
      demo.nodes,
      demo.edges,
      "n-g-start",
      "n-l2-atelier",
      true,
      demo.floors,
    );
    assert.deepEqual(r?.floorIds, ["g", "l1", "l2"]);
    assert.equal(
      r?.steps.some((x) => x.connector),
      true,
    );
  });
  it("avoids a closed edge and reports no broken graph", () => {
    const e = demo.edges.find((x) => x.id === "e1")!;
    e.active = false;
    const r = findRoute(demo.nodes, demo.edges, "n-g-start", "n-g-oliva");
    assert.notEqual(r, null);
    e.active = true;
    assert.deepEqual(validateGraph(demo.nodes, demo.edges), []);
  });
  it("searches by cuisine and synonyms", () => {
    assert.equal(
      search(demo, "italian food").some((x) => x.id === "oliva"),
      true,
    );
    assert.equal(
      search(demo, "washroom").some((x) => x.kind === "poi"),
      true,
    );
  });
  it("handles idle ad state and priority playlist", () => {
    assert.equal(idleTransition("ACTIVE", 0, 10000, 10, "tick"), "AD");
    assert.ok(
      playlist(
        demo.campaigns,
        demo.devices[0],
        new Date("2026-06-01T10:00:00Z"),
      ).length > 0,
    );
  });
});
