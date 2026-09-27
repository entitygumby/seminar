import type { Metadata } from "next";
import { collectPhotos, ERAS, getMemories, toPublic, type PublicMemory } from "@/lib/memories";
import { Seal } from "../Seal";
import { attributionText } from "../attribution";
import { PrintToolbar } from "./PrintToolbar";
import "./print.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fifty Years — Print Edition",
  robots: { index: false },
};

type Photo = ReturnType<typeof collectPhotos>[number];

type Sheet =
  | { kind: "photos"; era: string; showEra: boolean; layout: "stack" | "pair" | "single"; photos: Photo[] }
  | { kind: "messages"; first: boolean; messages: PublicMemory[] };

const isPortrait = (p: Photo) => p.height > p.width * 1.05;

/** Two landscape photos stacked, or two portraits side by side, per page. */
function paginatePhotos(photos: Photo[]): Sheet[] {
  const sheets: Sheet[] = [];
  for (const era of ERAS) {
    const inEra = photos.filter((p) => p.era === era);
    let first = true;
    const push = (layout: "stack" | "pair" | "single", group: Photo[]) => {
      sheets.push({ kind: "photos", era, showEra: first, layout, photos: group });
      first = false;
    };
    let wide: Photo[] = [];
    let tall: Photo[] = [];
    for (const p of inEra) {
      if (isPortrait(p)) {
        tall.push(p);
        if (tall.length === 2) (push("pair", tall), (tall = []));
      } else {
        wide.push(p);
        if (wide.length === 2) (push("stack", wide), (wide = []));
      }
    }
    // Leftovers: one landscape + one portrait share a page rather than taking one each.
    const rest = [...wide, ...tall];
    if (rest.length) push(rest.length === 2 ? "stack" : "single", rest);
  }
  return sheets;
}

/** Rough character budget per A4 page at 13pt so no message is split across pages. */
function paginateMessages(memories: PublicMemory[]): Sheet[] {
  const BUDGET = 2400;
  const OVERHEAD = 260;
  const sheets: Sheet[] = [];
  let current: PublicMemory[] = [];
  let used = 0;
  for (const m of memories.filter((m) => m.message)) {
    const cost = m.message.length + OVERHEAD + (m.message.match(/\n/g)?.length ?? 0) * 60;
    const budget = sheets.length === 0 ? BUDGET - 500 : BUDGET;
    if (current.length && used + cost > budget) {
      sheets.push({ kind: "messages", first: sheets.length === 0, messages: current });
      current = [];
      used = 0;
    }
    current.push(m);
    used += cost;
  }
  if (current.length) sheets.push({ kind: "messages", first: sheets.length === 0, messages: current });
  return sheets;
}

function PageNumber({ n }: { n: number }) {
  return <div className="folio">{n}</div>;
}

export default async function PrintEdition() {
  const memories = (await getMemories("approved")).map(toPublic);
  const photos = collectPhotos(memories);
  const photoSheets = paginatePhotos(photos);
  const messageSheets = paginateMessages(memories);
  const contributors = Array.from(new Set(memories.map((m) => m.name))).sort((a, b) => a.localeCompare(b));

  // Cover and dedication are pages 1–2; interior folios continue from 3.
  let page = 2;

  return (
    <div className="print-root">
      <PrintToolbar pageCount={3 + photoSheets.length + messageSheets.length + (contributors.length ? 1 : 0)} />

      {/* ── Cover ── */}
      <section className="sheet cover">
        <Seal size={110} />
        <p className="cover-dates">1976 &mdash; 2026</p>
        <h1 className="cover-title">Fifty Years</h1>
        <p className="cover-sub">A book of memories for</p>
        <p className="cover-name">Takayasu Sensei</p>
        <div className="cover-rule" />
        <p className="cover-from">
          With gratitude from the students of the
          <br />
          Takemusu Aiki Association
        </p>
      </section>

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
          <section key={`p${i}`} className={`sheet interior photos-${s.layout}`}>
            {i === 0 && <h2 className="chapter-title">Photographs</h2>}
            {s.showEra && (
              <p className="era-label">{s.era === "Undated" ? "From the archive" : s.era}</p>
            )}
            <div className="photo-grid">
              {s.photos.map((p) => (
                <figure key={p.url} className="photo">
                  <div className="photo-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.caption} loading="eager" />
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
              {s.messages.map((m) => (
                <article key={m.id} className="message">
                  <p className="message-body">{m.message}</p>
                  <p className="message-name">{m.name}</p>
                  {attributionText(m) && <p className="message-meta">{attributionText(m)}</p>}
                </article>
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
    </div>
  );
}
