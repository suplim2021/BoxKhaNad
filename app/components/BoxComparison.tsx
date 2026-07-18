"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import {
  fitIsometricScale,
  getCylinderAxis,
  getCylinderMeasurements,
  projectIsometric,
} from "../lib/isometric";
import styles from "./BoxComparison.module.css";

export type BoxShape = "rectangular" | "cylinder" | "sphere" | "irregular";

export type BoxViewMode = "isometric" | "front";

export interface VisualDimensions {
  /** Longest horizontal axis, in centimetres. */
  length: number;
  /** Second horizontal axis, in centimetres. */
  width: number;
  /** Vertical axis, in centimetres. */
  height: number;
}

export interface VisualBox {
  code: string;
  name?: string;
  dimensions: VisualDimensions;
}

export interface PackedItemVisual {
  label?: string;
  /** Bare item dimensions. */
  dimensions: VisualDimensions;
  /** Item plus protection. Falls back to dimensions when omitted. */
  packedDimensions?: VisualDimensions;
}

export interface BoxComparisonProps {
  recommended: VisualBox;
  nearestTooSmall?: VisualBox | null;
  nextLarger?: VisualBox | null;
  packedItem: PackedItemVisual;
  shapeType: BoxShape;
  viewMode?: BoxViewMode;
  compact?: boolean;
  className?: string;
}

type CSSVariables = CSSProperties & Record<`--${string}`, string>;

type BoxState = "tooSmall" | "recommended" | "nextLarger";

const STATE_LABELS: Record<BoxState, string> = {
  tooSmall: "เล็กไป",
  recommended: "น่าจะเหมาะ",
  nextLarger: "ใหญ่ขึ้น",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDimensions({ length, width, height }: VisualDimensions) {
  const format = (value: number) => value.toLocaleString("th-TH", { maximumFractionDigits: 2 });
  return `${format(length)} × ${format(width)} × ${format(height)}`;
}

function getBoxStyle(dimensions: VisualDimensions, projectionScale: number): CSSVariables {
  const projection = projectIsometric(dimensions, projectionScale);

  return {
    "--iso-lx": `${projection.lengthX}px`,
    "--iso-ly": `${projection.lengthY}px`,
    "--iso-dx": `${projection.depthX}px`,
    "--iso-dy": `${projection.depthY}px`,
    "--iso-h": `${projection.vertical}px`,
    "--iso-floor-half": `${(projection.lengthY + projection.depthY) / 2}px`,
  };
}

function getItemStyle(
  item: PackedItemVisual,
  box: VisualBox,
  projectionScale: number,
): CSSVariables {
  const packed = item.packedDimensions ?? item.dimensions;
  const itemProjection = projectIsometric(item.dimensions, projectionScale);
  const packedProjection = projectIsometric(packed, projectionScale);
  const boxProjection = projectIsometric(box.dimensions, projectionScale);
  const itemWidth = itemProjection.lengthX + itemProjection.depthX;
  const itemHeight = itemProjection.lengthY + itemProjection.depthY + itemProjection.vertical;
  const packedWidth = packedProjection.lengthX + packedProjection.depthX;
  const packedHeight = packedProjection.lengthY + packedProjection.depthY + packedProjection.vertical;
  const cylinderAxis = getCylinderAxis(item.dimensions);
  const itemCylinder = getCylinderMeasurements(item.dimensions, cylinderAxis);
  const packedCylinder = getCylinderMeasurements(packed, cylinderAxis);

  return {
    "--item-w": `${clamp(itemWidth, 24, (boxProjection.lengthX + boxProjection.depthX) * 0.84)}px`,
    "--item-h": `${clamp(itemHeight, 20, (boxProjection.lengthY + boxProjection.depthY + boxProjection.vertical) * 0.8)}px`,
    "--packed-w": `${clamp(packedWidth, 30, (boxProjection.lengthX + boxProjection.depthX) * 0.92)}px`,
    "--packed-h": `${clamp(packedHeight, 26, (boxProjection.lengthY + boxProjection.depthY + boxProjection.vertical) * 0.88)}px`,
    "--item-cylinder-axis": `${Math.max(22, itemCylinder.axis * projectionScale)}px`,
    "--item-cylinder-diameter": `${Math.max(16, itemCylinder.diameter * projectionScale * 0.78)}px`,
    "--packed-cylinder-axis": `${Math.max(28, packedCylinder.axis * projectionScale)}px`,
    "--packed-cylinder-diameter": `${Math.max(21, packedCylinder.diameter * projectionScale * 0.78)}px`,
    "--item-iso-lx": `${itemProjection.lengthX}px`,
    "--item-iso-ly": `${itemProjection.lengthY}px`,
    "--item-iso-dx": `${itemProjection.depthX}px`,
    "--item-iso-dy": `${itemProjection.depthY}px`,
    "--item-iso-h": `${itemProjection.vertical}px`,
    "--item-floor-half": `${(itemProjection.lengthY + itemProjection.depthY) / 2}px`,
    "--packed-iso-lx": `${packedProjection.lengthX}px`,
    "--packed-iso-ly": `${packedProjection.lengthY}px`,
    "--packed-iso-dx": `${packedProjection.depthX}px`,
    "--packed-iso-dy": `${packedProjection.depthY}px`,
    "--packed-iso-h": `${packedProjection.vertical}px`,
    "--packed-floor-half": `${(packedProjection.lengthY + packedProjection.depthY) / 2}px`,
  };
}

function ParcelCuboid({ protectedLayer = false }: { protectedLayer?: boolean }) {
  return (
    <span
      className={[
        styles.projectedParcel,
        protectedLayer ? styles.protectionCuboid : styles.itemCuboid,
      ].join(" ")}
    >
      <span className={`${styles.parcelFace} ${styles.parcelFrontFace}`} />
      <span className={`${styles.parcelFace} ${styles.parcelRightFace}`} />
      <span className={`${styles.parcelFace} ${styles.parcelTopFace}`} />
    </span>
  );
}

function ItemInside({ item, shapeType, box, projectionScale }: {
  item: PackedItemVisual;
  shapeType: BoxShape;
  box: VisualBox;
  projectionScale: number;
}) {
  const hasProtection = Boolean(item.packedDimensions);
  const cylinderAxis = getCylinderAxis(item.dimensions);
  const cylinderOrientation = shapeType === "cylinder"
    ? styles[`cylinderAxis_${cylinderAxis}`]
    : "";

  if (shapeType === "rectangular") {
    return (
      <span
        className={styles.contents}
        style={getItemStyle(item, box, projectionScale)}
        aria-hidden="true"
      >
        {hasProtection ? <ParcelCuboid protectedLayer /> : null}
        <ParcelCuboid />
      </span>
    );
  }

  return (
    <span
      className={styles.contents}
      style={getItemStyle(item, box, projectionScale)}
      aria-hidden="true"
    >
      {hasProtection ? (
        <span
          className={[
            styles.protection,
            shapeType === "cylinder" ? styles.shape_cylinder : "",
            cylinderOrientation,
          ].filter(Boolean).join(" ")}
        />
      ) : null}
      <span
        className={[styles.item, styles[`shape_${shapeType}`], cylinderOrientation]
          .filter(Boolean)
          .join(" ")}
      />
    </span>
  );
}

function Cuboid({
  box,
  state,
  projectionScale,
  isSelected,
  children,
}: {
  box: VisualBox;
  state: BoxState;
  projectionScale: number;
  isSelected: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={[
        styles.cuboid,
        styles[state],
        isSelected ? styles.selectedLayer : styles.mutedLayer,
      ].join(" ")}
      style={getBoxStyle(box.dimensions, projectionScale)}
      aria-hidden="true"
    >
      <span className={`${styles.face} ${styles.frontFace}`} />
      <span className={`${styles.face} ${styles.rightFace}`} />
      <span className={`${styles.face} ${styles.topFace}`} />
      {children}
    </div>
  );
}

function ChoiceButton({
  box,
  state,
  isSelected,
  onSelect,
}: {
  box?: VisualBox | null;
  state: BoxState;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={[styles.choiceButton, styles[`${state}Choice`]]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={isSelected}
      disabled={!box}
      onClick={onSelect}
    >
      <span className={styles.stateLabel}>{box ? STATE_LABELS[state] : "ไม่มีตัวเลือก"}</span>
      {box ? (
        <span className={styles.boxLabel}>
          <strong>{box.code}</strong>
          <span>{formatDimensions(box.dimensions)} ซม.</span>
        </span>
      ) : <span className={styles.emptyMark}>—</span>}
    </button>
  );
}

export function BoxComparison({
  recommended,
  nearestTooSmall,
  nextLarger,
  packedItem,
  shapeType,
  viewMode = "isometric",
  compact = false,
  className,
}: BoxComparisonProps) {
  const [selectedState, setSelectedState] = useState<BoxState>("recommended");
  const boxes = [recommended, nearestTooSmall, nextLarger].filter((box): box is VisualBox => Boolean(box));
  const projectionScale = fitIsometricScale(boxes.map(({ dimensions }) => dimensions));
  const bare = formatDimensions(packedItem.dimensions);
  const packed = formatDimensions(packedItem.packedDimensions ?? packedItem.dimensions);
  const summary = [
    `กล่องที่น่าจะเหมาะ ${recommended.code} ขนาด ${formatDimensions(recommended.dimensions)} เซนติเมตร`,
    nearestTooSmall ? `กล่อง ${nearestTooSmall.code} เล็กเกินไป` : "ไม่มีกล่องเล็กกว่าที่นำมาเปรียบเทียบ",
    nextLarger ? `กล่องถัดไป ${nextLarger.code}` : "ไม่มีกล่องใหญ่กว่าที่นำมาเปรียบเทียบ",
    `สิ่งของขนาด ${bare} เซนติเมตร หลังห่อขนาด ${packed} เซนติเมตร`,
  ].join(". ");
  const activeState =
    (selectedState === "tooSmall" && !nearestTooSmall) ||
    (selectedState === "nextLarger" && !nextLarger)
      ? "recommended"
      : selectedState;

  return (
    <section
      className={[
        styles.comparison,
        styles[viewMode],
        compact ? styles.compact : "",
        className,
      ].filter(Boolean).join(" ")}
      aria-label="ภาพเปรียบเทียบขนาดกล่อง"
    >
      <p className={styles.screenReaderOnly}>{summary}</p>
      <div className={styles.scene} aria-hidden="true">
        <span className={styles.backdropBlob} />
        <span className={styles.groundLine} />
        <div className={styles.boxStack}>
          {nextLarger ? (
            <Cuboid
              box={nextLarger}
              state="nextLarger"
              projectionScale={projectionScale}
              isSelected={activeState === "nextLarger"}
            />
          ) : null}
          <Cuboid
            box={recommended}
            state="recommended"
            projectionScale={projectionScale}
            isSelected={activeState === "recommended"}
          >
            <ItemInside
              item={packedItem}
              shapeType={shapeType}
              box={recommended}
              projectionScale={projectionScale}
            />
          </Cuboid>
          {nearestTooSmall ? (
            <Cuboid
              box={nearestTooSmall}
              state="tooSmall"
              projectionScale={projectionScale}
              isSelected={activeState === "tooSmall"}
            />
          ) : null}
        </div>
      </div>

      <div className={styles.choiceRail} role="group" aria-label="เลือกขนาดกล่องที่ต้องการเน้น">
        <ChoiceButton
          box={nearestTooSmall}
          state="tooSmall"
          isSelected={activeState === "tooSmall"}
          onSelect={() => setSelectedState("tooSmall")}
        />
        <ChoiceButton
          box={recommended}
          state="recommended"
          isSelected={activeState === "recommended"}
          onSelect={() => setSelectedState("recommended")}
        />
        <ChoiceButton
          box={nextLarger}
          state="nextLarger"
          isSelected={activeState === "nextLarger"}
          onSelect={() => setSelectedState("nextLarger")}
        />
      </div>

      <dl className={styles.textSummary}>
        <div>
          <dt>ของ</dt>
          <dd>{packedItem.label ?? "สิ่งของ"} · {bare} ซม.</dd>
        </div>
        <div>
          <dt>หลังห่อ</dt>
          <dd>{packed} ซม.</dd>
        </div>
      </dl>
    </section>
  );
}

export default BoxComparison;
