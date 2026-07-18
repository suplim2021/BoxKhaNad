import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBareRotation,
  calculatePackedSize,
  checkCatalog,
  findBoxes,
  getAxisOverflow,
  getClosestRotationForBox,
  getRotations,
  type ItemInput,
  type ParcelBox,
} from "../app/lib/box-fit.ts";
import { parcelBoxes } from "../app/data/boxes.ts";

const catalog: ParcelBox[] = [
  {
    id: "small",
    catalog: "thailand-post",
    family: "Test",
    code: "A",
    publishedSize: { length: 10, width: 20, height: 5 },
    usableSize: { length: 10, width: 20, height: 5 },
    dimensionType: "internal",
    sourceUrl: "https://example.com/a",
    checkedAt: "2026-07-18",
  },
  {
    id: "medium",
    catalog: "common-thai",
    family: "Test",
    code: "B",
    publishedSize: { length: 20, width: 20, height: 20 },
    dimensionType: "unspecified",
    sourceUrl: "https://example.com/b",
    checkedAt: "2026-07-18",
  },
  {
    id: "large",
    catalog: "common-thai",
    family: "Test",
    code: "C",
    publishedSize: { length: 30, width: 30, height: 30 },
    usableSize: { length: 30, width: 30, height: 30 },
    dimensionType: "internal",
    sourceUrl: "https://example.com/c",
    checkedAt: "2026-07-18",
  },
];

function item(changes: Partial<ItemInput> = {}): ItemInput {
  return {
    shape: "box",
    size: { length: 8, width: 18, height: 3 },
    protectionPerSide: 1,
    tolerancePerSide: 0,
    ...changes,
  };
}

test("adds protection and tolerance to both sides", () => {
  assert.deepEqual(
    calculatePackedSize(item({ protectionPerSide: 1, tolerancePerSide: 0.5 })),
    { length: 11, width: 21, height: 6 },
  );
});

test("uses diameter for sphere and cylinder width", () => {
  assert.deepEqual(
    calculatePackedSize(
      item({
        shape: "sphere",
        size: { length: 8, width: 99, height: 99 },
        protectionPerSide: 0,
      }),
    ),
    { length: 8, width: 8, height: 8 },
  );

  assert.deepEqual(
    calculatePackedSize(
      item({
        shape: "cylinder",
        size: { length: 8, width: 99, height: 20 },
        protectionPerSide: 0,
      }),
    ),
    { length: 8, width: 8, height: 20 },
  );
});

test("keeps the bare item in the rotation chosen for the packed item", () => {
  assert.deepEqual(
    calculateBareRotation(
      { length: 22.4, width: 12.4, height: 7.4 },
      { protectionPerSide: 1, tolerancePerSide: 0.2 },
    ),
    { length: 20, width: 10, height: 5 },
  );
});

test("keeps only unique rotations", () => {
  assert.equal(getRotations({ length: 1, width: 2, height: 3 }).length, 6);
  assert.equal(getRotations({ length: 2, width: 2, height: 3 }).length, 3);
  assert.equal(getRotations({ length: 2, width: 2, height: 2 }).length, 1);
});

test("finds a rotated verified fit", () => {
  const results = findBoxes(
    item({ protectionPerSide: 0 }),
    catalog,
    "thailand-post",
  );
  assert.equal(results.recommended?.box.id, "small");
  assert.equal(results.recommended?.certainty, "fits");
  assert.deepEqual(results.recommended?.clearance, {
    length: 2,
    width: 2,
    height: 2,
  });
});

test("marks unspecified published dimensions as likely", () => {
  const results = findBoxes(item(), catalog, "common-thai");
  assert.equal(results.recommended?.box.id, "medium");
  assert.equal(results.recommended?.certainty, "likely");
  assert.equal(results.nextLarger?.box.id, "large");
});

test("finds the deterministic nearest too-small box", () => {
  const results = findBoxes(
    item({
      size: { length: 21, width: 21, height: 21 },
      protectionPerSide: 0,
    }),
    catalog,
  );
  assert.equal(results.recommended?.box.id, "large");
  assert.equal(results.nearestTooSmall?.id, "medium");
});

test("finds the least-overflow rotation for a box that is too small", () => {
  const box = catalog[0];
  const rotation = getClosestRotationForBox(
    { length: 21, width: 9, height: 4 },
    box,
  );

  assert.deepEqual(rotation, { length: 9, width: 21, height: 4 });
  assert.deepEqual(getAxisOverflow(rotation, box), {
    length: 0,
    width: 1,
    height: 0,
  });
});

test("returns no match when every box is too small", () => {
  const results = findBoxes(
    item({
      size: { length: 100, width: 100, height: 100 },
      protectionPerSide: 0,
    }),
    catalog,
  );
  assert.equal(results.recommended, null);
  assert.equal(results.nextLarger, null);
  assert.equal(results.nearestTooSmall?.id, "large");
});

test("uses a stable code tie-breaker", () => {
  const tied = [
    { ...catalog[2], id: "tie-z", code: "Z" },
    { ...catalog[2], id: "tie-a", code: "A" },
  ];
  const results = findBoxes(item(), tied);
  assert.equal(results.recommended?.box.code, "A");
});

test("skips duplicate-size matches when choosing the next larger box", () => {
  const duplicateMedium = {
    ...catalog[1],
    id: "medium-copy",
    code: "B-copy",
  };
  const results = findBoxes(item(), [catalog[1], duplicateMedium, catalog[2]]);
  assert.equal(results.recommended?.box.id, "medium");
  assert.equal(results.nextLarger?.box.id, "large");
});

test("allows a tiny floating-point boundary difference", () => {
  const results = findBoxes(
    item({
      size: { length: 10.0000001, width: 20, height: 5 },
      protectionPerSide: 0,
    }),
    catalog.slice(0, 1),
  );
  assert.equal(results.recommended?.box.id, "small");
});

test("checks catalog sources and internal-size policy", () => {
  assert.deepEqual(checkCatalog(catalog), []);
  assert.deepEqual(checkCatalog(parcelBoxes), []);
  assert.match(
    checkCatalog([
      {
        ...catalog[1],
        id: "bad",
        usableSize: { length: 1, width: 1, height: 1 },
      },
    ])[0],
    /internal dimensions/,
  );
});
