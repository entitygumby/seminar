import type { Metadata } from "next";
import { collectPhotos, ERAS, getMemories, photoSrc, toPublic, type PublicMemory } from "@/lib/memories";
import { Seal } from "../Seal";
import { attributionText } from "../attribution";
import { PrintToolbar } from "./PrintToolbar";
import { CoverFront } from "./CoverFront";
import { LOW_RES_PX, MIXAM, TRIM } from "./specs";
import "./print.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fifty Years — Print Edition",
  robots: { index: false },
};

type Photo = ReturnType<typeof collectPhotos>[number];

type Sheet =
  | { kind: "photos"; era: string; showEra: boolean; layout: "pair" | "single"; photos: Photo[] }
  | { kind: "messages"; first: boolean; columns: PublicMemory[][] };

const isPortrait = (p: Photo) => p.height > p.width * 1.05;

/** One landscape photo per page, or two portraits side by side. */
function paginatePhotos(photos: Photo[]): Sheet[] {
  const sheets: Sheet[] = [];
  for (const era of ERAS) {
    const inEra = photos.filter((p) => p.era === era);
    let first = true;
    const push = (layout: "pair" | "single", group: Photo[]) => {
      sheets.push({ kind: "photos", era, showEra: first, layout, photos: group });
      first = false;
    };
    let tall: Photo[] = [];
    for (const p of inEra) {
      if (isPortrait(p)) {
        tall.push(p);
        if (tall.length === 2) (push("pair", tall), (tall = []));
      } else {
        push("single", [p]);
      }
    }
    if (tall.length) push("single", tall);
  }
  return sheets;
}

/**
 * Fills two 122 mm columns per A4 landscape page, so no message is split across columns
 * or pages. A column holds ~24 lines of ~60 characters at 13pt (fewer under the chapter
 * title); the budgets sit a little under that. Messages are capped at 1,200 characters,
 * so even the longest fits a column on its own.
 */
function paginateMessages(memories: PublicMemory[]): Sheet[] {
  const COLUMN = 1400;
  const FIRST_COLUMN = 1150;
  const OVERHEAD = 260;
  const sheets: Sheet[] = [];
  let columns: PublicMemory[][] = [[]];
  let used = 0;
  const flush = () => {
    sheets.push({ kind: "messages", first: sheets.length === 0, columns });
    columns = [[]];
  };
  for (const m of memories.filter((m) => m.message)) {
    const cost = m.message.length + OVERHEAD + (m.message.match(/\n/g)?.length ?? 0) * 60;
    const budget = sheets.length === 0 ? FIRST_COLUMN : COLUMN;
    const column = columns[columns.length - 1];
    if (column.length && used + cost > budget) {
      if (columns.length === 2) flush();
      else columns.push([]);
      used = 0;
    }
    columns[columns.length - 1].push(m);
    used += cost;
  }
  if (columns[0].length) flush();
  return sheets;
}

function PageNumber({ n }: { n: number }) {
  return <div className="folio">{n}</div>;
}

export default async function PrintEdition({ searchParams }: { searchParams: Promise<{ edition?: string }> }) {
  // "proof": A4 landscape with cover, for home printing. "mixam": interior pages only, 3mm bleed,
  // padded to a multiple of 4 — the cover is a separate spread at /memories/print/cover.
  const mixam = (await searchParams).edition === "mixam";
  const bleed = mixam ? MIXAM.interiorBleed : 0;

  const memories = (await getMemories("approved")).map(toPublic);
  const photos = collectPhotos(memories);
  const photoSheets = paginatePhotos(photos);
  const messageSheets = paginateMessages(memories);
  const contributors = Array.from(new Set(memories.map((m) => m.name))).sort((a, b) => a.localeCompare(b));

  const contentPages =
    (mixam ? 0 : 1) + 1 + photoSheets.length + messageSheets.length + (contributors.length ? 1 : 0) + 1;
  const blanks = mixam ? (4 - (contentPages % 4)) % 4 : 0;
  const lowRes = photos.filter((p) => p.width && Math.max(p.width, p.height) < LOW_RES_PX);

  // The dedication is page 1 in the Mixam interior (the cover is printed separately), page 2 in the proof.
  let page = mixam ? 1 : 2;

  return (
    <div
      className="print-root"
      style={{
        ["--bleed" as string]: `${bleed}mm`,
        ["--trim-w" as string]: `${TRIM.width}mm`,
        ["--trim-h" as string]: `${TRIM.height}mm`,
      }}
    >
      <style>{`@page { size: ${TRIM.width + bleed * 2}mm ${TRIM.height + bleed * 2}mm; margin: 0; }`}</style>
      <PrintToolbar
        edition={mixam ? "mixam" : "proof"}
        pageCount={contentPages + blanks}
        blanks={blanks}
        lowRes={lowRes.map((p) => `${p.caption || "Untitled"} (${p.credit}, ${Math.max(p.width, p.height)}px)`)}
      />

      {/* ── Cover (proof only) ── */}
      {!mixam && (
        <section className="sheet cover">
          <CoverFront />
        </section>
      )}

      {/* ── Dedication ── */}
      <section className="sheet dedication">
        <div className="dedication-inner">
          <p className="kanji-large">感謝</p>
          <p className="dedication-text">
            For fifty years, Sensei, you have stood at the front of the mat and shown us the way &mdash;
            patiently, precisely, and with the spirit of Iwama that you carried from O-Sensei and
            Saito Sensei to Australia.
          </p>
          <p className="dedication-text">
            The photographs and words in this book come from students past and present, from every
            dojo and every decade. Each one is a small thank you. Together, we hope they show how
            far your teaching has travelled.
          </p>
          <p className="dedication-sign">
            Presented at the 50th Anniversary Seminar
            <br />
            Pymble, Sydney &middot; 31 October 2026
          </p>
        </div>
      </section>

      {/* ── Photographs ── */}
      {photoSheets.map((s, i) => {
        if (s.kind !== "photos") return null;
        page++;
        return (
          <section key={`p${i}`} className={`sheet interior photos-${s.layout}${i === 0 ? " with-title" : ""}`}>
            {i === 0 && <h2 className="chapter-title">Photographs</h2>}
            {s.showEra && (
              <p className="era-label">{s.era === "Undated" ? "From the archive" : s.era}</p>
            )}
            <div className="photo-grid">
              {s.photos.map((p) => (
                <figure key={p.url} className="photo">
                  <div className="photo-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoSrc(p.url)} alt={p.caption} loading="eager" />
                  </div>
                  <figcaption>
                    {p.caption && <span className="caption">{p.caption}</span>}
                    <span className="credit">{p.credit}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <PageNumber n={page} />
          </section>
        );
      })}

      {/* ── Messages ── */}
      {messageSheets.map((s, i) => {
        if (s.kind !== "messages") return null;
        page++;
        return (
          <section key={`m${i}`} className="sheet interior">
            {s.first && (
              <>
                <h2 className="chapter-title">Messages to Sensei</h2>
                <div className="chapter-rule" />
              </>
            )}
            <div className="messages">
              {s.columns.map((column, c) => (
                <div key={c} className="message-column">
                  {column.map((m) => (
                    <article key={m.id} className="message">
                      <p className="message-body">{m.message}</p>
                      <p className="message-name">{m.name}</p>
                      {attributionText(m) && <p className="message-meta">{attributionText(m)}</p>}
                    </article>
                  ))}
                </div>
              ))}
            </div>
            <PageNumber n={page} />
          </section>
        );
      })}

      {/* ── Contributors ── */}
      {contributors.length > 0 && (
        <section className="sheet interior">
          <h2 className="chapter-title">With thanks from</h2>
          <div className="chapter-rule" />
          <ul className="contributors">
            {contributors.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <PageNumber n={++page} />
        </section>
      )}

      {/* ── Back page ── */}
      <section className="sheet back">
        <Seal size={56} />
        <p className="back-line">Dōmo arigatō gozaimashita, Sensei.</p>
        <p className="back-small">Takemusu Aiki Association Inc. &middot; 2026</p>
      </section>

      {Array.from({ length: blanks }, (_, i) => (
        <section key={`blank${i}`} className="sheet blank" aria-label="Blank page" />
      ))}
    </div>
  );
}
