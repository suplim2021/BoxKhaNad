import type { Size } from "./box-fit";

export const ISO_COS_30 = Math.sqrt(3) / 2;
export const ISO_SIN_30 = 0.5;
export const ISO_CIRCLE_MAJOR = Math.sqrt(3 / 2);
export const ISO_CIRCLE_MINOR = 1 / Math.sqrt(2);

export type CylinderAxis = "length" | "width" | "height";

export type IsometricProjection = {
  lengthX: number;
  lengthY: number;
  depthX: number;
  depthY: number;
  vertical: number;
};

function finitePositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function projectIsometric(size: Size, pixelsPerCentimetre: number): IsometricProjection {
  const scale = finitePositive(pixelsPerCentimetre);

  return {
    lengthX: finitePositive(size.length) * scale * ISO_COS_30,
    lengthY: finitePositive(size.length) * scale * ISO_SIN_30,
    depthX: finitePositive(size.width) * scale * ISO_COS_30,
    depthY: finitePositive(size.width) * scale * ISO_SIN_30,
    vertical: finitePositive(size.height) * scale,
  };
}

export function fitIsometricScale(
  sizes: Size[],
  targetWidth = 224,
  targetHeight = 190,
) {
  const safeSizes = sizes.length > 0 ? sizes : [{ length: 1, width: 1, height: 1 }];
  const widest = Math.max(
    ...safeSizes.map((size) =>
      (finitePositive(size.length) + finitePositive(size.width)) * ISO_COS_30,
    ),
  );
  const tallest = Math.max(
    ...safeSizes.map((size) =>
      (finitePositive(size.length) + finitePositive(size.width)) * ISO_SIN_30 +
      finitePositive(size.height),
    ),
  );

  return Math.min(targetWidth / widest, targetHeight / tallest, 5.2);
}

export function getCylinderAxis(size: Size): CylinderAxis {
  const lengthWidthDifference = Math.abs(size.length - size.width);
  const lengthHeightDifference = Math.abs(size.length - size.height);
  const widthHeightDifference = Math.abs(size.width - size.height);
  const closestPair = Math.min(
    lengthWidthDifference,
    lengthHeightDifference,
    widthHeightDifference,
  );

  if (closestPair === lengthWidthDifference) return "height";
  if (closestPair === lengthHeightDifference) return "width";
  return "length";
}

export function getCylinderMeasurements(size: Size, axis: CylinderAxis) {
  if (axis === "length") {
    return { axis: size.length, diameter: (size.width + size.height) / 2 };
  }
  if (axis === "width") {
    return { axis: size.width, diameter: (size.length + size.height) / 2 };
  }
  return { axis: size.height, diameter: (size.length + size.width) / 2 };
}

export function projectIsometricCircle(diameter: number, pixelsPerCentimetre: number) {
  const safeDiameter = finitePositive(diameter);
  const scale = finitePositive(pixelsPerCentimetre);

  return {
    major: safeDiameter * scale * ISO_CIRCLE_MAJOR,
    minor: safeDiameter * scale * ISO_CIRCLE_MINOR,
  };
}

export function projectIsometricCylinder(
  size: Size,
  pixelsPerCentimetre: number,
  axis = getCylinderAxis(size),
) {
  const scale = finitePositive(pixelsPerCentimetre);
  const cylinder = getCylinderMeasurements(size, axis);
  const face = projectIsometricCircle(cylinder.diameter, scale);
  const envelope = projectIsometric(size, scale);

  return {
    axis,
    axisLength: cylinder.axis * scale,
    faceMajor: face.major,
    faceMinor: face.minor,
    floorHalf: (envelope.lengthY + envelope.depthY) / 2,
    envelopeWidth: envelope.lengthX + envelope.depthX,
    envelopeHeight: envelope.lengthY + envelope.depthY + envelope.vertical,
  };
}
