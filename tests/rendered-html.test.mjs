import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = JSON.parse(
  await readFile(new URL("../app/documentContent.json", import.meta.url), "utf8"),
);
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("keeps the extracted Word content intact in project data", () => {
  assert.equal(content.stats.sections, 42);
  assert.equal(content.stats.tables, 38);
  assert.equal(content.stats.textItems, 889);
  assert.equal(
    content.contentHash,
    "3ab5e7e38145613a6415d7ebcb80f45e19e0d500773c46dbad3a1d9723564be2",
  );
  assert.equal(
    content.titleBlocks[0].text,
    "Strategic Tech-Enabled Operating Partnership",
  );
  assert.equal(
    content.titleBlocks[1].text,
    "إطار الشراكة التشغيلية والتقنية لخدمات Lifestyle & Concierge",
  );
  assert.equal(content.sections.at(-1).title, "42. الخلاصة التنفيذية");
});

test("uses the WOSOL document surface instead of the starter preview", () => {
  assert.match(layout, /<html lang="ar" dir="rtl">/);
  assert.match(page, /className="pattern-bg"/);
  assert.match(page, /className="exec-summary"/);
  assert.match(page, /className="site-footer"/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview|react-loading-skeleton/);
});
