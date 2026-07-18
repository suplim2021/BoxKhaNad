import assert from "node:assert/strict";
import test from "node:test";

import {
  fitIsometricScale,
  getCylinderAxis,
  projectIsometric,
} from "../app/lib/isometric.ts";

test("uses one isometric scale for both floor axes", () => {
  const projection = projectIsometric(
    { length: 30, width: 20, height: 10 },
    4,
  );

  assert.equal(projection.lengthX / 30, projection.depthX / 20);
  assert.equal(projection.lengthY / projection.lengthX, projection.depthY / projection.depthX);
  assert.ok(Math.abs(projection.lengthY / projection.lengthX - Math.tan(Math.PI / 6)) < 1e-12);
});

test("fits every compared box with one shared projection scale", () => {
  const sizes = [
    { length: 30, width: 20, height: 11 },
    { length: 25, width: 17, height: 18 },
    { length: 22, width: 35, height: 14 },
  ];
  const scale = fitIsometricScale(sizes);

  for (const size of sizes) {
    const projection = projectIsometric(size, scale);
    assert.ok(projection.lengthX + projection.depthX <= 224.000001);
    assert.ok(projection.lengthY + projection.depthY + projection.vertical <= 190.000001);
  }
});

test("detects the cylinder axis after every fitted rotation", () => {
  assert.equal(getCylinderAxis({ length: 8, width: 8, height: 20 }), "height");
  assert.equal(getCylinderAxis({ length: 20, width: 8, height: 8 }), "length");
  assert.equal(getCylinderAxis({ length: 8, width: 20, height: 8 }), "width");
});
