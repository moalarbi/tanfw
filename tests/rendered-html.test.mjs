import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = JSON.parse(
  await readFile(new URL("../app/documentContent.json", import.meta.url), "utf8"),
);
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const builtHtml = await readFile(
  new URL("../.next/server/app/index.html", import.meta.url),
  "utf8",
);

function toArabicDocumentMapTitle(title) {
  return title;
}

function collectSectionText(section) {
  const values = [section.title];

  for (const block of section.blocks) {
    if ("text" in block) {
      values.push(block.text);
    }

    if (block.rows) {
      for (const row of block.rows) {
        values.push(...row);
      }
    }
  }

  return values;
}

test("يحافظ على محتوى ملف وورد داخل بيانات المشروع", () => {
  assert.equal(content.stats.blocks, 834);
  assert.equal(content.stats.sections, 34);
  assert.equal(content.stats.tables, 20);
  assert.equal(content.stats.textItems, 814);
  assert.equal(
    content.contentHash,
    "2ce8d46ff01671082765a949fe230557c669b5b9c58088808b68e180ea9299d5",
  );
  assert.equal(
    content.titleBlocks[0].text,
    "الشراكة التشغيلية التقنية الاستراتيجية",
  );
  assert.equal(
    content.titleBlocks[1].text,
    "إطار الشراكة التشغيلية والتقنية لخدمات نمط الحياة والكونسيرج",
  );
  assert.equal(content.sections.at(-1).title, "42. الخلاصة التنفيذية");
});

test("يعرض كل السكاشن بدون كلمات إنجليزية", () => {
  const sectionsText = content.sections.flatMap(collectSectionText).join("\n");

  assert.doesNotMatch(sectionsText, /[A-Za-z]/);
});

test("يعرض عناوين السكاشن بدون رقم داخل نص العنوان", () => {
  assert.doesNotMatch(builtHtml, /<h2 class="section-title">\s*\d+\./);
  assert.doesNotMatch(builtHtml, /<h2 id="summary-title">\s*\d+\./);
  assert.doesNotMatch(builtHtml, /<h3 id="closing-title">\s*\d+\./);
  assert.doesNotMatch(builtHtml, /class="document-map-title">\s*\d+\./);
  assert.doesNotMatch(builtHtml, /class="document-map-title">\s*[\d٠-٩]+[.)،]/);
  assert.doesNotMatch(builtHtml, /class="section-title">\s*[\d٠-٩]+[.)،]/);
  assert.match(builtHtml, /class="document-map-title">الملخص التنفيذي<\/span>/);
  assert.match(builtHtml, /<h2 class="section-title">الحوكمة والتقارير<\/h2>/);
  assert.match(
    builtHtml,
    /<h2 class="section-title">النسخة النهائية المختصرة للتموضع الاستراتيجي<\/h2>/,
  );
});

test("يحذف أقسام التوقعات المالية المعتمدة", () => {
  const sectionTitles = content.sections.map((section) => section.title);
  const removedSectionNumbers = /^(28|29|30|31|32|33|39|40)\./;

  for (const title of sectionTitles) {
    assert.doesNotMatch(title, removedSectionNumbers);
  }
});

test("يطبق نطاقات الرصيد التشغيلي المعتمدة", () => {
  const serializedContent = JSON.stringify(content);

  assert.match(serializedContent, /1,000,000 – 2,000,000 ريال/);
  assert.match(serializedContent, /2,000,000 – 3,500,000 ريال/);
  assert.match(serializedContent, /3,500,000 – 5,000,000 ريال/);
});

test("يستخدم سطح الوثيقة النهائي بدل معاينة البداية", () => {
  assert.match(layout, /<html lang="ar" dir="rtl">/);
  assert.match(layout, /وُصُول كونسيرج/);
  assert.match(layout, /force-scroll-top/);
  assert.match(layout, /scrollRestoration/);
  assert.match(layout, /window\.scrollTo\(0, 0\)/);
  assert.match(page, /className="pattern-bg"/);
  assert.match(page, /className="hero-lockup"/);
  assert.match(page, /className="hero-rule"/);
  assert.match(page, /hero-altanfeethi-logo/);
  assert.match(page, /className="hero-banner"/);
  assert.match(page, /executive-hero-banner\.png/);
  assert.match(page, /className="closing-banner"/);
  assert.match(page, /executive-closing-banner\.png/);
  assert.match(page, /className="exec-summary"/);
  assert.match(page, /className="document-shell"/);
  assert.match(page, /className="document-flow"/);
  assert.match(page, /className="document-map section-index"/);
  assert.match(page, /className="request-journey"/);
  assert.match(page, /function OperationalIntegrationDiagram/);
  assert.match(page, /function tableCellClassName/);
  assert.match(page, /isOperationalIntegration\(section\)/);
  assert.match(page, /className="journey-card"/);
  assert.match(page, /فهرس العناوين/);
  assert.doesNotMatch(page, /Document Map|Document map/);
  assert.doesNotMatch(page, /سري · 2026 ·/);
  assert.doesNotMatch(page, /Strategic Section|Final Insight|Executive Summary/);
  assert.match(page, />WOSOL</);
  assert.match(page, />CONCIERGE</);
  assert.doesNotMatch(page, />\s*Confidential\s*</);
  assert.doesNotMatch(page, /Strategic Tech-Enabled Operating Partnership|Lifestyle & Concierge/);
  assert.doesNotMatch(page, /section-title-en|closing-label|exec-label/);
  assert.doesNotMatch(page, /cards-grid|strategy-card/);
  assert.doesNotMatch(page, /BackButton|back-btn/);
  assert.match(page, /className="site-footer"/);
  assert.match(page, /className="footer-lockup"/);
  assert.match(page, /className="footer-altanfeethi-logo"/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview|react-loading-skeleton/);
  assert.match(styles, /\.intro-lockup\s*{[^}]*align-items:\s*end;/s);
  assert.match(styles, /\.hero-lockup\s*{[^}]*align-items:\s*end;/s);
  assert.match(styles, /\.footer-lockup\s*{[^}]*align-items:\s*end;/s);
});

test("يعرض فهرس العناوين بدون كلمات إنجليزية", () => {
  const documentMapTitles = [
    content.titleBlocks[1].text,
    ...content.sections.map((section) => section.title),
  ].map(toArabicDocumentMapTitle);

  assert.doesNotMatch(documentMapTitles.join("\n"), /[A-Za-z]/);
});

test("يبقي الجداول مقروءة لمحتوى عربي من اليمين إلى اليسار", () => {
  assert.match(styles, /\.compare-table\s*{[^}]*direction:\s*rtl;/s);
  assert.match(styles, /\.compare-table th,\s*\.compare-table td\s*{[^}]*border-left:\s*1px solid var\(--border\);/s);
  assert.match(styles, /\.compare-table th,\s*\.compare-table td\s*{[^}]*unicode-bidi:\s*isolate;/s);
  assert.match(styles, /\.compare-table th\.en,\s*\.compare-table td\.en\s*{[^}]*direction:\s*ltr;/s);
  assert.match(styles, /\.compare-table th\.en,\s*\.compare-table td\.en\s*{[^}]*text-align:\s*right;/s);
  assert.match(styles, /\.compare-table th\.table-number,\s*\.compare-table td\.table-number\s*{[^}]*direction:\s*rtl;/s);
  assert.match(styles, /\.compare-table th\.table-number,\s*\.compare-table td\.table-number\s*{[^}]*text-align:\s*right;/s);
  assert.match(styles, /\.table-number-text,\s*\.percent-token\s*{[^}]*display:\s*inline-block;/s);
  assert.match(styles, /\.table-number-text,\s*\.percent-token\s*{[^}]*direction:\s*ltr;/s);
  assert.match(builtHtml, /class="table-number"[^>]*><span class="table-number-text">20%<\/span>/);
  assert.match(builtHtml, /class="table-number"[^>]*><span class="table-number-text">15%<\/span>/);
  assert.match(builtHtml, /حصة وُصُول <span class="percent-token">70%<\/span>/);
  assert.match(builtHtml, /حصة التنفيذي <span class="percent-token">30%<\/span>/);
  assert.match(builtHtml, /<th[^>]*>البند<\/th><th[^>]*>التفاصيل<\/th>/);
  assert.match(builtHtml, /<th[^>]*>البند<\/th><th[^>]*>القيمة<\/th>/);
  assert.match(builtHtml, /<th[^>]*>المؤشر<\/th><th[^>]*>الهدف<\/th>/);
  assert.match(builtHtml, /<th[^>]*>الطرف<\/th><th[^>]*>الحصة<\/th>/);
  assert.match(builtHtml, /<th[^>]*>الطرف<\/th><th[^>]*>الحصة من هامش الطلب<\/th>/);
});
