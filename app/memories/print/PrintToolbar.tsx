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

export function PrintToolbar({ pageCount }: { pageCount: number }) {
  const [preparing, setPreparing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="print-toolbar">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <a href="/memories" className="font-sans text-xs tracking-[0.2em] uppercase text-washi/60 hover:text-washi">
          &larr; Album
        </a>
        <p className="font-serif text-lg flex-1">
          Print edition <span className="text-washi/50">&middot; A4 &middot; {pageCount} pages</span>
        </p>
        <button onClick={() => setShowHelp((s) => !s)} className="font-sans text-xs tracking-[0.2em] uppercase text-washi/60 hover:text-washi">
          Print tips
        </button>
        <button
          onClick={async () => {
            setPreparing(true);
            await imagesLoaded();
            setPreparing(false);
            window.print();
          }}
          className="bg-shu text-white font-sans text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 hover:bg-white hover:text-sumi transition-colors"
        >
          {preparing ? "Loading photos…" : "Download PDF"}
        </button>
      </div>
      {showHelp && (
        <div className="max-w-5xl mx-auto px-6 pb-5 font-sans text-sm text-washi/80 leading-relaxed">
          In the print dialog choose <strong>Save as PDF</strong>, paper size <strong>A4</strong>, margins{" "}
          <strong>None</strong>, and tick <strong>Background graphics</strong>. Chrome or Edge give the most
          faithful result. The PDF can go straight to a photobook printer or a local print shop — ask for A4
          portrait on heavyweight matte or silk stock.
        </div>
      )}
    </div>
  );
}
