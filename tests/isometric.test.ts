import assert from "node:assert/strict";
import test from "node:test";

import {
  fitIsometricScale,
  getCylinderAxis,
  projectIsometricCircle,
  projectIsometricCylinder,
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

test("projects circular cylinder ends as true isometric ellipses", () => {
  const face = projectIsometricCircle(10, 4);

  assert.ok(Math.abs(face.major / face.minor - Math.sqrt(3)) < 1e-12);
  assert.ok(Math.abs(face.major - 40 * Math.sqrt(3 / 2)) < 1e-12);
  assert.ok(Math.abs(face.minor - 40 / Math.sqrt(2)) < 1e-12);
});

test("keeps every cylinder measurement monotonic without independent visual clamps", () => {
  const small = projectIsometricCylinder({ length: 3, width: 3, height: 8 }, 4);
  const large = projectIsometricCylinder({ length: 6, width: 6, height: 8 }, 4);

  assert.equal(small.axisLength, large.axisLength);
  assert.ok(large.faceMajor > small.faceMajor);
  assert.ok(large.faceMinor > small.faceMinor);
  assert.ok(Math.abs(small.faceMajor / small.faceMinor - Math.sqrt(3)) < 1e-12);
  assert.ok(Math.abs(large.faceMajor / large.faceMinor - Math.sqrt(3)) < 1e-12);
});

test("exposes one floor center for every cylinder rotation", () => {
  const boxFloorHalf = projectIsometric({ length: 30, width: 20, height: 11 }, 4);
  const expectedFloorCenter = (boxFloorHalf.lengthY + boxFloorHalf.depthY) / 2;

  for (const size of [
    { length: 20, width: 8, height: 8 },
    { length: 8, width: 20, height: 8 },
    { length: 8, width: 8, height: 20 },
  ]) {
    const cylinder = projectIsometricCylinder(size, 4);
    const anchorBottom = expectedFloorCenter - cylinder.floorHalf;
    assert.ok(Math.abs(anchorBottom + cylinder.floorHalf - expectedFloorCenter) < 1e-12);
  }
});
