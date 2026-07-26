import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: {
        accept: "text/html",
        host: "localhost",
        "x-forwarded-proto": "http",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the BoxKhaNad calculator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>BoxKhaNad/);
  assert.match(html, /ขนาดไหนถึงพอดี/);
  assert.match(html, /กล่องที่น่าจะเหมาะ/);
  assert.match(html, /วัสดุกันกระแทก/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /กล่องพัสดุทั่วไป A\/B\/C/);
  assert.match(html, /type="range"/);
  assert.match(html, /max="45"/);
  assert.doesNotMatch(html, /ด้านหน้า/);
  assert.match(html, /aria-label="เลือกขนาดกล่องที่ต้องการเน้น"/);
  assert.match(html, /เพิ่มยาว/);
  assert.match(html, /ส่วนต่างจากขนาดที่ประกาศ/);
  assert.match(html, /property="og:image" content="https:\/\/boxkhanad\.suplim\.chatgpt\.site\/og.png"/);
  assert.match(html, /property="og:image:alt" content="BoxKhaNad กล่องขนาดไหนถึงพอดี"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
  assert.doesNotMatch(html, /Hong Thai Postal Box|ดูแหล่งข้อมูลขนาดกล่อง|source-link/);
});

test("removes the disposable starter and metadata", async () => {
  const [page, layout, packageJson, css, comparisonCss, comparisonComponent] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/BoxComparison.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/BoxComparison.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /BoxCalculator/);
  assert.match(layout, /lang="th"/);
  assert.match(layout, /BoxKhaNad/);
  assert.match(css, /Playpen Sans Thai/);
  assert.match(comparisonCss, /cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
  assert.match(comparisonCss, /bottom: calc\(44px - var\(--iso-floor-half\)\)/);
  assert.match(comparisonCss, /\.projectedParcel/);
  assert.match(comparisonCss, /\.cylinderAnchor/);
  assert.match(comparisonCss, /\.cylinderPackedAnchor/);
  assert.match(comparisonCss, /\.isometricCylinder/);
  assert.match(comparisonCss, /\.cylinderBody/);
  assert.match(comparisonCss, /\.cylinderCap/);
  assert.match(comparisonCss, /\.cylinderAxis_(length|width|height)/);
  assert.match(comparisonCss, /\.cylinderAxis_length \{[\s\S]*?rotate\(30deg\)/);
  assert.match(comparisonCss, /\.cylinderAxis_width \.cylinderBackCap/);
  assert.match(comparisonCss, /\.cylinderAxis_height \{[\s\S]*?rotate\(-90deg\)/);
  assert.match(comparisonComponent, /styles\.cylinderAnchor[\s\S]*?hasProtection \? styles\.cylinderPackedAnchor/);
  assert.doesNotMatch(comparisonComponent, /cylinderProtectionAnchor/);
  assert.match(comparisonCss, /\.overflowAlert/);
  assert.doesNotMatch(comparisonCss, /\.front \.cuboid/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(css, /\.catalog-filter button \{[\s\S]*?min-height: 44px;/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
