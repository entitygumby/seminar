"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CoverToolbar({
  binding,
  spine,
  width,
  height,
}: {
  binding: "hardcover" | "paperback";
  spine: number;
  width: number;
  height: number;
}) {
  const router = useRouter();
  const [spineInput, setSpineInput] = useState(String(spine || ""));
  const go = (b: string, sp: string) => router.push(`/memories/print/cover?binding=${b}&spine=${sp || 0}`);

  return (
    <div className="print-toolbar">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans text-sm">
        <a href="/memories/print?edition=mixam" className="text-xs tracking-[0.2em] uppercase text-washi/60 hover:text-washi">
          &larr; Interior
        </a>
        <p className="font-serif text-lg flex-1">
          Mixam cover <span className="text-washi/50">&middot; {width.toFixed(1)} &times; {height} mm</span>
        </p>
        <select
          value={binding}
          onChange={(e) => go(e.target.value, spineInput)}
          className="bg-transparent border border-washi/30 px-2 py-1.5"
        >
          <option value="hardcover" className="text-sumi">Hardcover</option>
          <option value="paperback" className="text-sumi">Paperback</option>
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(binding, spineInput);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="spine" className="text-washi/70">Spine (mm)</label>
          <input
            id="spine"
            inputMode="decimal"
            value={spineInput}
            onChange={(e) => setSpineInput(e.target.value)}
            className="w-16 bg-transparent border border-washi/30 px-2 py-1.5"
          />
          <button className="text-xs tracking-[0.2em] uppercase text-washi/70 hover:text-washi">Apply</button>
        </form>
        <button
          onClick={() => window.print()}
          disabled={!spine}
          className="bg-shu text-white text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 hover:bg-white hover:text-sumi transition-colors disabled:opacity-40"
        >
          Download cover PDF
        </button>
      </div>
      {!spine && (
        <p className="max-w-6xl mx-auto px-6 pb-4 text-sm text-washi/80">
          Enter the spine width Mixam gives you for your page count and paper (shown on the quote/upload page).
        </p>
      )}
    </div>
  );
}
