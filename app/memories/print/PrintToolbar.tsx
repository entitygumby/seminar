"use client";

import { useState } from "react";

async function imagesLoaded() {
  await Promise.all(
    Array.from(document.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
    )
  );
  await document.fonts.ready;
}

export function PrintToolbar({
  edition,
  pageCount,
  blanks,
  lowRes,
}: {
  edition: "proof" | "mixam";
  pageCount: number;
  blanks: number;
  lowRes: string[];
}) {
  const [preparing, setPreparing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const mixam = edition === "mixam";

  const tab = (active: boolean) =>
    `text-xs tracking-[0.2em] uppercase px-3 py-2 ${active ? "bg-washi text-sumi" : "text-washi/60 hover:text-washi"}`;

  return (
    <div className="print-toolbar">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans">
        <a href="/memories" className="text-xs tracking-[0.2em] uppercase text-washi/60 hover:text-washi">
          &larr; Album
        </a>
        <div className="flex gap-1">
          <a href="/memories/print" className={tab(!mixam)}>A4 proof</a>
          <a href="/memories/print?edition=mixam" className={tab(mixam)}>Mixam interior</a>
          <a href="/memories/print/cover" className={tab(false)}>Mixam cover</a>
        </div>
        <p className="font-serif text-lg flex-1">
          {pageCount} pages
          <span className="text-washi/50">
            {mixam ? " · 216 × 303 mm (A4 + 3 mm bleed)" : " · A4"}
            {blanks > 0 && ` · incl. ${blanks} blank to reach a multiple of 4`}
          </span>
        </p>
        <button onClick={() => setShowHelp((s) => !s)} className="text-xs tracking-[0.2em] uppercase text-washi/60 hover:text-washi">
          {lowRes.length > 0 ? `Checks (${lowRes.length})` : "Print tips"}
        </button>
        <button
          onClick={async () => {
            setPreparing(true);
            await imagesLoaded();
            setPreparing(false);
            window.print();
          }}
          className="bg-shu text-white text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 hover:bg-white hover:text-sumi transition-colors"
        >
          {preparing ? "Loading photos…" : mixam ? "Download interior PDF" : "Download PDF"}
        </button>
      </div>
      {showHelp && (
        <div className="max-w-6xl mx-auto px-6 pb-5 font-sans text-sm text-washi/80 leading-relaxed space-y-2">
          <p>
            Use <strong>Chrome or Edge</strong>. In the print dialog choose <strong>Save as PDF</strong>, leave
            paper size as set by the page, margins <strong>None</strong>, scale <strong>100</strong>, and tick{" "}
            <strong>Background graphics</strong>.
          </p>
          {mixam && (
            <p>
              Upload this as the interior and the Mixam cover as the cover. Mixam converts the colours to CMYK
              on upload, so reds and the paper tone may shift slightly — check their online proof before paying.
            </p>
          )}
          {lowRes.length > 0 && (
            <div>
              <p className="text-washi">These photos may print soft (under ~250 dpi at their size on the page):</p>
              <ul className="list-disc pl-5">
                {lowRes.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
