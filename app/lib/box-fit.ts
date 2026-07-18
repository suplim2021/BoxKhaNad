export type Shape = "box" | "cylinder" | "sphere" | "irregular";
export type CatalogFilter = "all" | "thailand-post" | "common-thai";

export type Size = {
  length: number;
  width: number;
  height: number;
};

export type ItemInput = {
  shape: Shape;
  size: Size;
  protectionPerSide: number;
  tolerancePerSide: number;
};

export type ParcelBox = {
  id: string;
  catalog: Exclude<CatalogFilter, "all">;
  family: string;
  code: string;
  publishedSize: Size;
  usableSize?: Size;
  dimensionType: "internal" | "external" | "unspecified";
  sourceUrl: string;
  checkedAt: string;
};

export type BoxMatch = {
  box: ParcelBox;
  rotatedItem: Size;
  clearance: Size;
  unusedVolume: number;
  worstAxisClearance: number;
  certainty: "fits" | "likely";
};

export type BoxResults = {
  packedItem: Size;
  recommended: BoxMatch | null;
  nextLarger: BoxMatch | null;
  nearestTooSmall: ParcelBox | null;
  allMatches: BoxMatch[];
};

const EPSILON = 0.000001;

function volume(size: Size) {
  return size.length * size.width * size.height;
}

export function calculatePackedSize(input: ItemInput): Size {
  let baseSize = input.size;

  if (input.shape === "sphere") {
    baseSize = {
      length: input.size.length,
      width: input.size.length,
      height: input.size.length,
    };
  }

  if (input.shape === "cylinder") {
    baseSize = {
      length: input.size.length,
      width: input.size.length,
      height: input.size.height,
    };
  }

  // Protection and tolerance cover both opposite sides of every axis.
  const extra = 2 * (input.protectionPerSide + input.tolerancePerSide);

  return {
    length: baseSize.length + extra,
    width: baseSize.width + extra,
    height: baseSize.height + extra,
  };
}

export function calculateBareRotation(
  rotatedPackedItem: Size,
  input: Pick<ItemInput, "protectionPerSide" | "tolerancePerSide">,
): Size {
  const extra = 2 * (input.protectionPerSide + input.tolerancePerSide);

  return {
    length: Math.max(0, rotatedPackedItem.length - extra),
    width: Math.max(0, rotatedPackedItem.width - extra),
    height: Math.max(0, rotatedPackedItem.height - extra),
  };
}

export function getRotations(size: Size): Size[] {
  const rawRotations: Size[] = [
    { length: size.length, width: size.width, height: size.height },
    { length: size.length, width: size.height, height: size.width },
    { length: size.width, width: size.length, height: size.height },
    { length: size.width, width: size.height, height: size.length },
    { length: size.height, width: size.length, height: size.width },
    { length: size.height, width: size.width, height: size.length },
  ];

  const unique: Size[] = [];
  const seen = new Set<string>();

  for (const rotation of rawRotations) {
    const key = `${rotation.length}|${rotation.width}|${rotation.height}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(rotation);
    }
  }

  return unique;
}

function sizeUsedForFit(box: ParcelBox) {
  if (box.dimensionType === "internal" && box.usableSize) {
    return { size: box.usableSize, certainty: "fits" as const };
  }

  return { size: box.publishedSize, certainty: "likely" as const };
}

function matchOneBox(packedItem: Size, box: ParcelBox): BoxMatch | null {
  const boxForFit = sizeUsedForFit(box);
  let bestMatch: BoxMatch | null = null;

  for (const rotatedItem of getRotations(packedItem)) {
    const clearance = {
      length: boxForFit.size.length - rotatedItem.length,
      width: boxForFit.size.width - rotatedItem.width,
      height: boxForFit.size.height - rotatedItem.height,
    };

    const fits =
      clearance.length >= -EPSILON &&
      clearance.width >= -EPSILON &&
      clearance.height >= -EPSILON;

    if (!fits) continue;

    const current: BoxMatch = {
      box,
      rotatedItem,
      clearance: {
        length: Math.max(0, clearance.length),
        width: Math.max(0, clearance.width),
        height: Math.max(0, clearance.height),
      },
      unusedVolume: Math.max(0, volume(boxForFit.size) - volume(packedItem)),
      worstAxisClearance: Math.max(
        Math.max(0, clearance.length),
        Math.max(0, clearance.width),
        Math.max(0, clearance.height),
      ),
      certainty: boxForFit.certainty,
    };

    if (!bestMatch) {
      bestMatch = current;
      continue;
    }

    const currentWorstGap = Math.max(...Object.values(current.clearance));
    const bestWorstGap = Math.max(...Object.values(bestMatch.clearance));
    if (currentWorstGap < bestWorstGap) bestMatch = current;
  }

  return bestMatch;
}

function tooSmallScore(packedItem: Size, box: ParcelBox) {
  const boxSize = sizeUsedForFit(box).size;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const rotatedItem of getRotations(packedItem)) {
    const score =
      Math.max(0, rotatedItem.length - boxSize.length) +
      Math.max(0, rotatedItem.width - boxSize.width) +
      Math.max(0, rotatedItem.height - boxSize.height);
    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

export function findBoxes(
  input: ItemInput,
  boxes: ParcelBox[],
  filter: CatalogFilter = "all",
): BoxResults {
  const packedItem = calculatePackedSize(input);
  const visibleBoxes = boxes.filter(
    (box) => filter === "all" || box.catalog === filter,
  );

  const allMatches: BoxMatch[] = [];
  for (const box of visibleBoxes) {
    const match = matchOneBox(packedItem, box);
    if (match) allMatches.push(match);
  }

  allMatches.sort((a, b) => {
    return (
      a.unusedVolume - b.unusedVolume ||
      a.worstAxisClearance - b.worstAxisClearance ||
      a.box.catalog.localeCompare(b.box.catalog) ||
      a.box.code.localeCompare(b.box.code, "en", { numeric: true })
    );
  });

  const matchingIds = new Set(allMatches.map((match) => match.box.id));
  const tooSmall = visibleBoxes.filter((box) => !matchingIds.has(box.id));
  tooSmall.sort((a, b) => {
    return (
      tooSmallScore(packedItem, a) - tooSmallScore(packedItem, b) ||
      volume(a.publishedSize) - volume(b.publishedSize) ||
      a.code.localeCompare(b.code, "en", { numeric: true })
    );
  });

  const recommended = allMatches[0] ?? null;
  const nextLarger = recommended
    ? allMatches.find(
        (match) => match.unusedVolume > recommended.unusedVolume + EPSILON,
      ) ?? null
    : null;

  return {
    packedItem,
    recommended,
    nextLarger,
    nearestTooSmall: tooSmall[0] ?? null,
    allMatches,
  };
}

export function checkCatalog(boxes: ParcelBox[]) {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const box of boxes) {
    if (ids.has(box.id)) errors.push(`Duplicate id: ${box.id}`);
    ids.add(box.id);

    if (!box.sourceUrl.startsWith("https://")) {
      errors.push(`Missing secure source: ${box.id}`);
    }

    for (const value of Object.values(box.publishedSize)) {
      if (!Number.isFinite(value) || value <= 0) {
        errors.push(`Invalid published size: ${box.id}`);
      }
    }

    if (box.usableSize && box.dimensionType !== "internal") {
      errors.push(`Usable size requires internal dimensions: ${box.id}`);
    }
  }

  return errors;
}
