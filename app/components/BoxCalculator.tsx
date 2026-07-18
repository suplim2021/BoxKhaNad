"use client";

import { useId, useState, type CSSProperties } from "react";
import BoxComparison, {
  type BoxShape,
  type VisualBox,
} from "./BoxComparison";
import { parcelBoxes } from "../data/boxes";
import {
  calculateBareRotation,
  findBoxes,
  getAxisOverflow,
  getClosestRotationForBox,
  type CatalogFilter,
  type ItemInput,
  type ParcelBox,
  type Shape,
  type Size,
} from "../lib/box-fit";
import { fitIsometricScale } from "../lib/isometric";

const shapeOptions: Array<{
  value: Shape;
  icon: string;
  label: string;
  helper: string;
}> = [
  { value: "box", icon: "📦", label: "สี่เหลี่ยม", helper: "กล่อง หนังสือ ของแบน" },
  { value: "cylinder", icon: "🥫", label: "ทรงกระบอก", helper: "ขวด กระป๋อง ม้วน" },
  { value: "sphere", icon: "⚽", label: "ทรงกลม", helper: "ลูกบอล ของทรงกลม" },
  { value: "irregular", icon: "🧸", label: "รูปทรงอื่น", helper: "วัดกรอบที่ครอบของทั้งหมด" },
];

const protectionOptions = [
  { value: 0, label: "ไม่ห่อ" },
  { value: 0.5, label: "บาง 0.5 ซม." },
  { value: 1, label: "ปกติ 1 ซม." },
  { value: 2, label: "หนา 2 ซม." },
];

const catalogOptions: Array<{ value: CatalogFilter; label: string }> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "thailand-post", label: "ไปรษณีย์ไทย" },
  { value: "common-thai", label: "A / B / C" },
];

const MAX_CATALOG_AXIS = Math.max(
  ...parcelBoxes.flatMap(({ publishedSize }) => Object.values(publishedSize)),
);

const CATALOG_ISOMETRIC_SCALE = fitIsometricScale(
  parcelBoxes.map(({ publishedSize }) => publishedSize),
);

function formatNumber(value: number) {
  return value.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatSize(size: Size) {
  return `${formatNumber(size.length)} × ${formatNumber(size.width)} × ${formatNumber(size.height)} ซม.`;
}

function visualBox(box: ParcelBox): VisualBox {
  return {
    code: box.code,
    name: box.family,
    dimensions: box.publishedSize,
  };
}

function displayBoxFamily(box: ParcelBox) {
  return box.catalog === "thailand-post"
    ? "กล่องพัสดุไปรษณีย์"
    : "กล่องพัสดุทั่วไป A/B/C";
}

function NumberField({
  label,
  value,
  min = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <span className="number-input-wrap">
        <input
          type="number"
          min={min}
          step="0.1"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span aria-hidden="true">ซม.</span>
      </span>
    </label>
  );
}

function DimensionControl({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const min = 0.5;
  const step = 0.5;
  const progress = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  function setBoundedValue(next: number) {
    onChange(Math.min(max, Math.max(min, next)));
  }

  function nudge(direction: -1 | 1) {
    const next = Number((value + direction * step).toFixed(1));
    setBoundedValue(next);
  }

  return (
    <div className="dimension-control">
      <div className="dimension-control-topline">
        <label htmlFor={`${id}-number`}>{label}</label>
        <span className="dimension-value">
          <input
            id={`${id}-number`}
            type="number"
            min={min}
            max={max}
            step="0.1"
            inputMode="decimal"
            value={value}
            aria-label={`${label} หน่วยเซนติเมตร`}
            onChange={(event) => setBoundedValue(Number(event.target.value))}
          />
          <span aria-hidden="true">ซม.</span>
        </span>
      </div>
      <div className="dimension-adjuster">
        <button
          type="button"
          aria-label={`ลด${label}`}
          disabled={value <= min}
          onClick={() => nudge(-1)}
        >
          −
        </button>
        <input
          className="dimension-range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          aria-label={`ปรับ${label}`}
          style={{ "--range-progress": `${progress}%` } as CSSProperties}
          onChange={(event) => setBoundedValue(Number(event.target.value))}
        />
        <button
          type="button"
          aria-label={`เพิ่ม${label}`}
          disabled={value >= max}
          onClick={() => nudge(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BoxCalculator() {
  const [shape, setShape] = useState<Shape>("box");
  const [size, setSize] = useState<Size>({ length: 12, width: 8, height: 5 });
  const [protection, setProtection] = useState(1);
  const [customProtection, setCustomProtection] = useState(false);
  const [catalog, setCatalog] = useState<CatalogFilter>("all");

  const itemInput: ItemInput = {
    shape,
    size,
    protectionPerSide: protection,
    tolerancePerSide: 0.2,
  };

  const validInput =
    size.length > 0 &&
    (shape === "cylinder" || shape === "sphere" || size.width > 0) &&
    (shape === "sphere" || size.height > 0) &&
    protection >= 0;

  // The catalog is small, so recalculating directly keeps the code easy to follow.
  const results = validInput ? findBoxes(itemInput, parcelBoxes, catalog) : null;

  const chosenShape = shapeOptions.find((option) => option.value === shape);
  const visualShape: BoxShape = shape === "box" ? "rectangular" : shape;
  const recommendation = results?.recommended;
  const overflowBox = !recommendation ? results?.nearestTooSmall : null;
  const overflowRotation = results && overflowBox
    ? getClosestRotationForBox(results.packedItem, overflowBox)
    : null;
  const visualMatch = recommendation
    ? { box: recommendation.box, rotatedItem: recommendation.rotatedItem, overflow: false }
    : overflowBox && overflowRotation
      ? { box: overflowBox, rotatedItem: overflowRotation, overflow: true }
      : null;
  const visualOverflow = visualMatch?.overflow
    ? getAxisOverflow(visualMatch.rotatedItem, visualMatch.box)
    : null;

  function updateSize(axis: keyof Size, value: number) {
    setSize((current) => ({ ...current, [axis]: value }));
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-mark" aria-hidden="true">
          <span>↗</span>
          <span>□</span>
        </div>
        <p className="eyebrow">BOXKHANAD · ขนาดไหนถึงพอดี?</p>
        <h1>วัดของ แล้วเจอกล่องที่<br /><span>น่าจะพอดีที่สุด</span></h1>
        <p className="hero-copy">
          รวมความหนาวัสดุกันกระแทกให้แล้ว พร้อมลองหมุนของให้ครบทุกด้าน
        </p>
      </header>

      <div className="workspace">
        <section className="calculator-card" aria-labelledby="calculator-title">
          <div className="section-heading">
            <span className="step-badge">1</span>
            <div>
              <h2 id="calculator-title">ของที่จะส่งเป็นทรงไหน?</h2>
              <p>เลือกแบบที่ใกล้ที่สุด</p>
            </div>
          </div>

          <fieldset className="shape-grid">
            <legend className="sr-only">เลือกรูปทรงสิ่งของ</legend>
            {shapeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`shape-option ${shape === option.value ? "is-selected" : ""}`}
                aria-pressed={shape === option.value}
                onClick={() => setShape(option.value)}
              >
                <span className="shape-icon" aria-hidden="true">{option.icon}</span>
                <strong>{option.label}</strong>
                <small>{option.helper}</small>
              </button>
            ))}
          </fieldset>

          <div className="section-divider" />

          <div className="section-heading compact">
            <span className="step-badge">2</span>
            <div>
              <h2>ใส่ขนาดของ</h2>
              <p>{chosenShape?.helper}</p>
            </div>
          </div>

          {visualMatch && results ? (
            <BoxComparison
              className="mobile-live-visual"
              compact
              recommended={visualBox(visualMatch.box)}
              nearestTooSmall={!visualMatch.overflow && results.nearestTooSmall ? visualBox(results.nearestTooSmall) : null}
              nextLarger={!visualMatch.overflow && results.nextLarger ? visualBox(results.nextLarger.box) : null}
              packedItem={{
                label: chosenShape?.label,
                dimensions: calculateBareRotation(visualMatch.rotatedItem, itemInput),
                packedDimensions: visualMatch.rotatedItem,
              }}
              shapeType={visualShape}
              projectionScale={CATALOG_ISOMETRIC_SCALE}
              overflow={visualMatch.overflow}
            />
          ) : null}

          <div className="dimension-grid">
            {shape === "cylinder" || shape === "sphere" ? (
              <DimensionControl
                label="เส้นผ่านศูนย์กลาง"
                value={size.length}
                max={MAX_CATALOG_AXIS}
                onChange={(value) => updateSize("length", value)}
              />
            ) : (
              <>
                <DimensionControl label="ยาว" value={size.length} max={MAX_CATALOG_AXIS} onChange={(value) => updateSize("length", value)} />
                <DimensionControl label="กว้าง" value={size.width} max={MAX_CATALOG_AXIS} onChange={(value) => updateSize("width", value)} />
              </>
            )}
            {shape !== "sphere" ? (
              <DimensionControl label="สูง" value={size.height} max={MAX_CATALOG_AXIS} onChange={(value) => updateSize("height", value)} />
            ) : null}
          </div>

          <div className="section-divider" />

          <div className="section-heading compact">
            <span className="step-badge">3</span>
            <div>
              <h2>วัสดุกันกระแทกหนาแค่ไหน?</h2>
              <p>ความหนาต่อหนึ่งด้าน เช่น 1 ซม. จะเพิ่มแกนละ 2 ซม. และเผื่อการวัดอีกด้านละ 0.2 ซม.</p>
            </div>
          </div>

          <fieldset className="chip-row">
            <legend className="sr-only">เลือกความหนาวัสดุกันกระแทก</legend>
            {protectionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={!customProtection && protection === option.value}
                className={!customProtection && protection === option.value ? "is-selected" : ""}
                onClick={() => {
                  setCustomProtection(false);
                  setProtection(option.value);
                }}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={customProtection}
              className={customProtection ? "is-selected" : ""}
              onClick={() => setCustomProtection(true)}
            >
              กำหนดเอง
            </button>
          </fieldset>

          {customProtection ? (
            <div className="custom-protection">
              <NumberField label="ความหนาต่อด้าน" value={protection} min={0} onChange={setProtection} />
            </div>
          ) : null}
        </section>

        <section className="result-card" aria-labelledby="result-title">
          <div className="result-topline">
            <div>
              <p className="eyebrow">ผลลัพธ์ทันที</p>
              <h2 id="result-title">กล่องที่น่าจะเหมาะ</h2>
            </div>
          </div>

          <fieldset className="catalog-filter">
            <legend className="sr-only">กรองประเภทกล่อง</legend>
            {catalogOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={catalog === option.value ? "is-selected" : ""}
                aria-pressed={catalog === option.value}
                onClick={() => setCatalog(option.value)}
              >
                {option.label}
              </button>
            ))}
          </fieldset>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {visualMatch
              ? visualMatch.overflow
                ? `ยังไม่มีกล่องที่พอดี กล่องที่ใกล้เคียงที่สุดคือ ${visualMatch.box.code} ขนาด ${formatSize(visualMatch.box.publishedSize)}`
                : `กล่องที่น่าจะเหมาะ ${visualMatch.box.code} ขนาด ${formatSize(visualMatch.box.publishedSize)}`
              : "ยังไม่พบกล่องที่น่าจะเหมาะ"}
          </p>
          <div>
            {!validInput ? (
              <div className="empty-result">กรอกขนาดมากกว่า 0 เพื่อดูผล</div>
            ) : visualMatch && results ? (
              <>
                <BoxComparison
                  className="desktop-result-visual"
                  recommended={visualBox(visualMatch.box)}
                  nearestTooSmall={!visualMatch.overflow && results.nearestTooSmall ? visualBox(results.nearestTooSmall) : null}
                  nextLarger={!visualMatch.overflow && results.nextLarger ? visualBox(results.nextLarger.box) : null}
                  packedItem={{
                    label: chosenShape?.label,
                    dimensions: calculateBareRotation(
                      visualMatch.rotatedItem,
                      itemInput,
                    ),
                    packedDimensions: visualMatch.rotatedItem,
                  }}
                  shapeType={visualShape}
                  projectionScale={CATALOG_ISOMETRIC_SCALE}
                  overflow={visualMatch.overflow}
                />

                <article className={`recommendation-panel ${visualMatch.overflow ? "is-overflow" : ""}`}>
                  <div className="recommendation-code">
                    <span>{visualMatch.overflow ? "ยังเล็ก" : "น่าจะเหมาะ"}</span>
                    <strong>{visualMatch.box.code}</strong>
                  </div>
                  <div className="recommendation-copy">
                    <h3>{displayBoxFamily(visualMatch.box)}</h3>
                    <p>{formatSize(visualMatch.box.publishedSize)}</p>
                  </div>
                </article>

                <dl className="result-facts">
                  <div>
                    <dt>ของหลังห่อ</dt>
                    <dd>{formatSize(results.packedItem)}</dd>
                  </div>
                   <div>
                     <dt>{visualMatch.overflow ? "ท่าที่เกินน้อยที่สุด" : "ท่าที่ใช้คำนวณ"}</dt>
                     <dd>{formatSize(visualMatch.rotatedItem)}</dd>
                   </div>
                   <div>
                     <dt>{visualMatch.overflow ? "ส่วนที่เกินกล่อง" : "ส่วนต่างจากขนาดที่ประกาศ"}</dt>
                     <dd>
                       {visualMatch.overflow && visualOverflow
                         ? formatSize(visualOverflow)
                         : recommendation
                           ? formatSize(recommendation.clearance)
                           : "—"}
                     </dd>
                   </div>
                </dl>

                <aside className={`source-warning ${visualMatch.overflow ? "overflow-warning" : ""}`}>
                  <span aria-hidden="true">ⓘ</span>
                  <p>
                    {visualMatch.overflow ? (
                      <><strong>ใหญ่เกินรายการกล่อง:</strong> ลดขนาดหรือวัสดุกันกระแทก หรือใช้กล่องขนาดกำหนดเอง</>
                    ) : (
                      <><strong>ผลแบบเผื่อไว้:</strong> แหล่งข้อมูลระบุเพียง “ขนาด” แต่ไม่ยืนยันขนาดภายใน จึงควรวัดด้านในกล่องจริงก่อนซื้อจำนวนมาก</>
                    )}
                  </p>
                </aside>

              </>
            ) : (
              <div className="empty-result">
                <strong>ยังไม่มีกล่องในชุดข้อมูลที่ใหญ่พอ</strong>
                <span>ลองลดความหนากันกระแทก หรือใช้กล่องกำหนดเองในเวอร์ชันถัดไป</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer>
        <p>BoxKhaNad · เครื่องมือทดลองสำหรับเทียบขนาดก่อนแพ็กจริง</p>
        <p>ข้อมูลกล่องตรวจล่าสุด 18 ก.ค. 2026</p>
      </footer>
    </main>
  );
}
