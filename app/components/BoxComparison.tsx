"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

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

function finitePositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function formatDimensions({ length, width, height }: VisualDimensions) {
  const format = (value: number) => value.toLocaleString("th-TH", { maximumFractionDigits: 2 });
  return `${format(length)} × ${format(width)} × ${format(height)}`;
}

function getBoxStyle(dimensions: VisualDimensions, maximumAxis: number): CSSVariables {
  const length = finitePositive(dimensions.length);
  const width = finitePositive(dimensions.width);
  const height = finitePositive(dimensions.height);
  const lengthX = clamp((length / maximumAxis) * 132, 62, 132);
  const depthX = clamp((width / maximumAxis) * 76, 32, 76);

  return {
    "--iso-lx": `${lengthX}px`,
    "--iso-ly": `${lengthX * 0.46}px`,
    "--iso-dx": `${depthX}px`,
    "--iso-dy": `${depthX * 0.46}px`,
    "--iso-h": `${clamp((height / maximumAxis) * 112, 48, 112)}px`,
  };
}

function getItemStyle(item: PackedItemVisual, box: VisualBox): CSSVariables {
  const packed = item.packedDimensions ?? item.dimensions;
  const itemWidth = clamp(item.dimensions.length / finitePositive(box.dimensions.length), 0.18, 0.82);
  const itemHeight = clamp(item.dimensions.height / finitePositive(box.dimensions.height), 0.18, 0.76);
  const packedWidth = clamp(packed.length / finitePositive(box.dimensions.length), itemWidth, 0.9);
  const packedHeight = clamp(packed.height / finitePositive(box.dimensions.height), itemHeight, 0.84);

  return {
    "--item-w": `${itemWidth * 100}%`,
    "--item-h": `${itemHeight * 100}%`,
    "--packed-w": `${packedWidth * 100}%`,
    "--packed-h": `${packedHeight * 100}%`,
  };
}

function ItemInside({ item, shapeType, box }: {
  item: PackedItemVisual;
  shapeType: BoxShape;
  box: VisualBox;
}) {
  const hasProtection = Boolean(item.packedDimensions);

  return (
    <span className={styles.contents} style={getItemStyle(item, box)} aria-hidden="true">
      {hasProtection ? <span className={styles.protection} /> : null}
      <span
        className={[styles.item, styles[`shape_${shapeType}`]]
          .filter(Boolean)
          .join(" ")}
      />
    </span>
  );
}

function Cuboid({
  box,
  state,
  maximumAxis,
  isSelected,
  children,
}: {
  box: VisualBox;
  state: BoxState;
  maximumAxis: number;
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
      style={getBoxStyle(box.dimensions, maximumAxis)}
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
  const maximumAxis = Math.max(
    1,
    ...boxes.flatMap(({ dimensions }) => [dimensions.length, dimensions.width, dimensions.height].map(finitePositive)),
  );
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
              maximumAxis={maximumAxis}
              isSelected={activeState === "nextLarger"}
            />
          ) : null}
          <Cuboid
            box={recommended}
            state="recommended"
            maximumAxis={maximumAxis}
            isSelected={activeState === "recommended"}
          >
            <ItemInside item={packedItem} shapeType={shapeType} box={recommended} />
          </Cuboid>
          {nearestTooSmall ? (
            <Cuboid
              box={nearestTooSmall}
              state="tooSmall"
              maximumAxis={maximumAxis}
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
