import Image from "next/image";
import data from "./documentContent.json";

type HeadingBlock = {
  type: "heading";
  level: number | null;
  style: string;
  text: string;
};

type ParagraphBlock = {
  type: "paragraph";
  level: null;
  style: string;
  text: string;
};

type TableBlock = {
  type: "table";
  rows: string[][];
};

type ContentBlock = HeadingBlock | ParagraphBlock | TableBlock;

type Section = {
  title: string;
  blocks: ContentBlock[];
};

type JourneyStep = {
  title: string;
  lead: string[];
  details: string[];
};

type DocumentData = {
  titleBlocks: HeadingBlock[];
  sections: Section[];
  stats: {
    blocks: number;
    sections: number;
    tables: number;
    textItems: number;
  };
};

const documentData = data as DocumentData;
const [strategicTitle, arabicTitle, relationshipTitle] = documentData.titleBlocks;
const [summarySection, ...remainingSections] = documentData.sections;
const closingSection = remainingSections.at(-1);
const bodySections = closingSection ? remainingSections.slice(0, -1) : remainingSections;
const documentMapEntries = [
  { number: "00", title: displaySectionTitle(arabicTitle.text), href: "#top" },
  { number: "01", title: displaySectionTitle(summarySection.title), href: "#summary" },
  ...bodySections.map((section, index) => ({
    number: padSection(index + 1),
    title: displaySectionTitle(section.title),
    href: `#${sectionId(index)}`,
  })),
  ...(closingSection
    ? [
        {
          number: padSection(bodySections.length + 1),
          title: displaySectionTitle(closingSection.title),
          href: "#closing",
        },
      ]
    : []),
];

function displaySectionTitle(title: string) {
  return title
    .replace(/^\s*[\d٠-٩]+\s*[.)،]?\s*/, "")
    .replace(/\s*[.)،]\s*[\d٠-٩]+\s*$/, "")
    .replace(/\s+[\d٠-٩]+\s*[.)،]\s*$/, "")
    .trim();
}

function padSection(index: number) {
  return String(index + 1).padStart(2, "0");
}

function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function textClassName(text: string, base = "") {
  return `${base} ${hasArabic(text) ? "" : "en"}`.trim();
}

function tableCellClassName(text: string) {
  if (isTableNumber(text)) {
    return "table-number";
  }

  return textClassName(text);
}

function isTableNumber(text: string) {
  return /^[\d\s,.%٪–+-]+$/.test(text.trim());
}

function tableCellContent(text: string) {
  if (!isTableNumber(text)) {
    return text.split(/(\d[\d,.\s]*[%٪])/g).map((part, index) =>
      /^\d[\d,.\s]*[%٪]$/.test(part) ? (
        <span className="percent-token" key={`${part}-${index}`}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  }

  return <span className="table-number-text">{text}</span>;
}

function orderedTableRows(rows: string[][]) {
  const [head, ...body] = rows;
  const primaryColumnIndex = head.findIndex((cell) =>
    ["البند", "المؤشر", "الطرف"].includes(cell.trim()),
  );

  if (primaryColumnIndex <= 0) {
    return rows;
  }

  const columnOrder = [
    primaryColumnIndex,
    ...head.map((_, index) => index).filter((index) => index !== primaryColumnIndex),
  ];
  const orderRow = (row: string[]) => columnOrder.map((index) => row[index] ?? "");

  return [orderRow(head), ...body.map(orderRow)];
}

function sectionId(index: number) {
  return `section-${padSection(index + 1)}`;
}

function isRequestJourney(section: Section) {
  return section.title.includes("رحلة الطلب");
}

function isOperationalIntegration(section: Section) {
  return section.title.includes("التكامل التشغيلي المقترح");
}

function toJourneySteps(blocks: ContentBlock[]) {
  const steps: JourneyStep[] = [];
  let currentStep: JourneyStep | null = null;

  for (const block of blocks) {
    if (block.type === "heading") {
      currentStep = {
        title: block.text,
        lead: [],
        details: [],
      };
      steps.push(currentStep);
      continue;
    }

    if (block.type !== "paragraph" || !currentStep) {
      continue;
    }

    if (block.style === "Normal") {
      currentStep.details.push(block.text);
    } else {
      currentStep.lead.push(block.text);
    }
  }

  return steps;
}

function toFlowJourney(blocks: ContentBlock[]) {
  const heading = blocks.find(
    (block): block is HeadingBlock => block.type === "heading",
  );
  const flow = blocks.find(
    (block): block is ParagraphBlock =>
      block.type === "paragraph" && block.text.includes("⬇"),
  );
  const steps =
    flow?.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line !== "⬇")
      .map((line) => ({
        title: line,
        lead: [],
        details: [],
      })) ?? [];

  return {
    heading: heading?.text,
    steps,
  };
}

function toRenderable(blocks: ContentBlock[]) {
  const items: Array<ContentBlock | { type: "list"; items: ParagraphBlock[] }> =
    [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === "paragraph" && block.style === "Normal") {
      const listItems: ParagraphBlock[] = [block];

      while (
        blocks[index + 1]?.type === "paragraph" &&
        (blocks[index + 1] as ParagraphBlock).style === "Normal"
      ) {
        listItems.push(blocks[index + 1] as ParagraphBlock);
        index += 1;
      }

      if (listItems.length >= 3) {
        items.push({ type: "list", items: listItems });
      } else {
        items.push(...listItems);
      }
    } else {
      items.push(block);
    }
  }

  return items;
}

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {toRenderable(blocks).map((block, index) => {
        if (block.type === "table") {
          return <DataTable key={`table-${index}`} rows={block.rows} />;
        }

        if (block.type === "list") {
          return (
            <ul className="document-list" key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`} className={textClassName(item.text)}>
                  {item.text}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "heading") {
          const levelClass = block.level === 3 ? "subheading-small" : "subheading";

          return (
            <h3 className={textClassName(block.text, levelClass)} key={`heading-${index}`}>
              {block.text}
            </h3>
          );
        }

        return (
          <p className={textClassName(block.text, "document-paragraph")} key={`p-${index}`}>
            {block.text}
          </p>
        );
      })}
    </>
  );
}

function DataTable({ rows }: { rows: string[][] }) {
  const [head, ...body] = orderedTableRows(rows);

  return (
    <div className="compare-scroll">
      <table className="compare-table">
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th key={`head-${index}`} className={tableCellClassName(cell)}>
                {tableCellContent(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${cellIndex}`} className={tableCellClassName(cell)}>
                  {tableCellContent(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JourneyDiagram({
  ariaLabel,
  steps,
}: {
  ariaLabel: string;
  steps: JourneyStep[];
}) {
  return (
    <div className="request-journey" aria-label={ariaLabel}>
      <div className="request-journey-track">
        {steps.map((step, index) => {
          const marker = step.title.match(/Step\s+(\d+)/)?.[1] ?? String(index + 1);

          return (
            <article className="journey-step" key={step.title}>
              <span className="journey-marker en" aria-hidden="true">
                {marker.padStart(2, "0")}
              </span>
              <div className="journey-card">
                <h3 className={textClassName(step.title, "journey-title")}>{step.title}</h3>
                {step.lead.map((line) => (
                  <p className={textClassName(line, "journey-lead")} key={line}>
                    {line}
                  </p>
                ))}
                {step.details.length > 0 ? (
                  <ul className="journey-detail-list">
                    {step.details.map((detail) => (
                      <li className={textClassName(detail)} key={detail}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function RequestJourneyDiagram({ blocks }: { blocks: ContentBlock[] }) {
  return <JourneyDiagram ariaLabel="رحلة الطلب" steps={toJourneySteps(blocks)} />;
}

function OperationalIntegrationDiagram({ blocks }: { blocks: ContentBlock[] }) {
  const { heading, steps } = toFlowJourney(blocks);

  return (
    <div className="operational-journey">
      {heading ? <h3 className="journey-flow-title">{heading}</h3> : null}
      <JourneyDiagram ariaLabel={heading ?? "رحلة الطلب"} steps={steps} />
    </div>
  );
}

function SectionHeader({
  section,
  index,
}: {
  section: Section;
  index: number;
}) {
  return (
    <div className="section-header">
      <span className="section-num">{padSection(index)}</span>
      <div>
        <h2 className="section-title">{displaySectionTitle(section.title)}</h2>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="site-intro" aria-hidden="true">
        <div className="intro-lockup">
          <div className="intro-wosol-mark logo-block">
            <span className="logo-name">WOSOL</span>
            <span className="logo-sub">CONCIERGE</span>
          </div>
          <div className="intro-altanfeethi-mark">
            <Image
              src="/assets/brand/altanfeethi-logo-navy.svg?v=altanfeethi-intro-20260721"
              alt=""
              width={207}
              height={150}
              priority
              unoptimized
            />
          </div>
        </div>
        <div className="intro-line" />
        <p className="intro-title">{strategicTitle.text}</p>
      </div>
      <div className="pattern-bg" />
      <div className="page-wrapper" id="top">
        <header className="site-header">
          <div className="hero-lockup" aria-label="WOSOL Concierge and التنفيذي">
            <div className="hero-wosol-logo logo-block">
              <span className="logo-name">WOSOL</span>
              <span className="logo-sub">CONCIERGE</span>
            </div>
            <div className="hero-altanfeethi-logo">
              <Image
                src="/assets/brand/altanfeethi-logo-navy.svg?v=altanfeethi-hero-20260721"
                alt="التنفيذي"
                width={190}
                height={138}
                priority
                unoptimized
              />
            </div>
          </div>
          <div className="hero-rule" />
          <div className="title-block">
            <span className="doc-label">{strategicTitle.text}</span>
            <h1 className="page-title">{arabicTitle.text}</h1>
            <p className="page-title-context">{relationshipTitle.text}</p>
          </div>
        </header>

        <main>
          <figure className="hero-banner">
            <Image
              src="/assets/media/executive-hero-banner.png"
              alt="تجربة سفر تنفيذية فاخرة"
              width={1916}
              height={821}
              priority
            />
          </figure>

          <div className="document-shell">
            <div className="document-flow">
              <section className="exec-summary" id="summary" aria-labelledby="summary-title">
                <h2 id="summary-title">{displaySectionTitle(summarySection.title)}</h2>
                <div className="exec-content">
                  <ContentBlocks blocks={summarySection.blocks} />
                </div>
              </section>

              {bodySections.map((section, index) => (
                <section className="section" id={sectionId(index)} key={section.title}>
                  <SectionHeader section={section} index={index + 1} />
                  <div className="section-body">
                    {isRequestJourney(section) ? (
                      <RequestJourneyDiagram blocks={section.blocks} />
                    ) : isOperationalIntegration(section) ? (
                      <OperationalIntegrationDiagram blocks={section.blocks} />
                    ) : (
                      <ContentBlocks blocks={section.blocks} />
                    )}
                  </div>
                </section>
              ))}

              {closingSection ? (
                <section className="closing-section" id="closing" aria-labelledby="closing-title">
                  <h3 id="closing-title">{displaySectionTitle(closingSection.title)}</h3>
                  <div className="closing-body">
                    <ContentBlocks blocks={closingSection.blocks} />
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="document-map section-index" aria-labelledby="toc-title">
              <div className="document-map-frame">
                <div className="document-map-label" id="toc-title">
                  فهرس العناوين
                </div>
                <nav className="document-map-list" aria-label="فهرس العناوين">
                  {documentMapEntries.map((entry) => (
                    <a className="document-map-item" href={entry.href} key={`${entry.number}-${entry.title}`}>
                      <span className="document-map-title">{entry.title}</span>
                      <span className="document-map-num">{entry.number}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>

          <figure className="closing-banner">
            <Image
              src="/assets/media/executive-closing-banner.png"
              alt="تجربة استقبال تنفيذية فاخرة"
              width={1916}
              height={821}
            />
          </figure>
        </main>

        <footer className="site-footer">
          <div className="footer-lockup" aria-label="WOSOL Concierge and التنفيذي">
            <div className="footer-logo" aria-label="WOSOL Concierge">
              <span className="logo-name">WOSOL</span>
              <span className="logo-sub">CONCIERGE</span>
            </div>
            <div className="footer-altanfeethi-logo" aria-label="التنفيذي">
              <Image
                src="/assets/brand/altanfeethi-logo-navy.svg?v=altanfeethi-footer-20260721"
                alt="التنفيذي"
                width={132}
                height={96}
                unoptimized
              />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
