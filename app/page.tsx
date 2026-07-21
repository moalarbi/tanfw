import data from "./documentContent.json";
import { BackButton } from "./BackButton";

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

type DocumentData = {
  titleBlocks: HeadingBlock[];
  sections: Section[];
  stats: {
    sections: number;
    tables: number;
    textItems: number;
  };
};

const documentData = data as DocumentData;
const [englishTitle, arabicTitle, relationshipTitle] = documentData.titleBlocks;
const [summarySection, ...remainingSections] = documentData.sections;
const closingSection = remainingSections.at(-1);
const bodySections = closingSection ? remainingSections.slice(0, -1) : remainingSections;

function padSection(index: number) {
  return String(index + 1).padStart(2, "0");
}

function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function textClassName(text: string, base = "") {
  return `${base} ${hasArabic(text) ? "" : "en"}`.trim();
}

function sectionId(index: number) {
  return `section-${padSection(index + 1)}`;
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
  const [head, ...body] = rows;

  return (
    <div className="compare-scroll">
      <table className="compare-table">
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th key={`head-${index}`} className={textClassName(cell)}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${cellIndex}`} className={textClassName(cell)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
        <h2 className="section-title">{section.title}</h2>
        <p className="section-title-en">Strategic Section</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="pattern-bg" />
      <div className="page-wrapper" id="top">
        <header className="site-header">
          <div className="header-meta">Strategic Partnership Document · 2026</div>
          <div className="logo-block" aria-label="WOSOL Concierge">
            <span className="logo-name">WOSOL</span>
            <span className="logo-sub">CONCIERGE</span>
          </div>
        </header>

        <main>
          <div className="title-block">
            <span className="doc-label">{englishTitle.text}</span>
            <h1 className="page-title">{arabicTitle.text}</h1>
            <p className="page-title-context">{relationshipTitle.text}</p>
          </div>

          <section className="exec-summary" aria-labelledby="summary-title">
            <span className="exec-label">Executive Summary</span>
            <h2 id="summary-title">{summarySection.title}</h2>
            <div className="exec-content">
              <ContentBlocks blocks={summarySection.blocks} />
            </div>
          </section>

          <section className="section section-index" aria-labelledby="toc-title">
            <div className="grid-label" id="toc-title">
              Document Sections
            </div>
            <div className="cards-grid">
              {bodySections.map((section, index) => (
                <a className="strategy-card" href={`#${sectionId(index)}`} key={section.title}>
                  <span className="card-num">Section {padSection(index + 1)}</span>
                  <h3 className="card-title">{section.title}</h3>
                  <span className="card-cta">
                    فتح القسم
                    <span className="card-cta-arrow" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          {bodySections.map((section, index) => (
            <section className="section" id={sectionId(index)} key={section.title}>
              <SectionHeader section={section} index={index + 1} />
              <div className="section-body">
                <ContentBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}

          {closingSection ? (
            <section className="closing-section" aria-labelledby="closing-title">
              <span className="closing-label">Final Insight</span>
              <h3 id="closing-title">{closingSection.title}</h3>
              <div className="closing-body">
                <ContentBlocks blocks={closingSection.blocks} />
              </div>
            </section>
          ) : null}
        </main>

        <footer className="site-footer">
          <div className="footer-logo" aria-label="WOSOL Concierge">
            <span className="logo-name">WOSOL</span>
            <span className="logo-sub">CONCIERGE</span>
          </div>
          <div className="footer-meta">
            Confidential · 2026 · {documentData.stats.sections} Sections ·{" "}
            {documentData.stats.tables} Tables
          </div>
        </footer>
      </div>
      <BackButton />
    </>
  );
}
