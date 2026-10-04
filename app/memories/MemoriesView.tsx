"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collectPhotos, ERAS, photoSrc, type Era, type PublicMemory } from "@/lib/memories-shared";
import { Seal } from "./Seal";
import { ContributeForm } from "./ContributeForm";
import { attributionText } from "./attribution";

type AlbumPhoto = ReturnType<typeof collectPhotos>[number];

/* ──────────────────────── HEADER ──────────────────────── */
function Header() {
  return (
    <header className="absolute top-0 inset-x-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="font-serif text-lg font-semibold tracking-wide text-sumi">
          Takemusu Aiki Association
        </a>
        <nav className="hidden sm:flex gap-8">
          {[
            ["#archive", "Archive"],
            ["#memories", "Memories"],
            ["#contribute", "Contribute"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-sumi-light hover:text-shu transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ──────────────────────── HERO ──────────────────────── */
function Hero() {
  return (
    <section className="relative washi-texture overflow-hidden">
      <div
        aria-hidden
        className="font-jp absolute right-6 md:right-16 top-24 text-[7rem] md:text-[11rem] leading-none text-sumi/[0.05] select-none pointer-events-none"
        style={{ writingMode: "vertical-rl" }}
      >
        感謝
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="max-w-2xl">
          <Seal size={64} className="mb-10 animate-fade-up" />
          <p className="animate-fade-up animation-delay-100 font-sans text-xs tracking-[0.35em] uppercase text-shu font-semibold mb-6">
            1976 &mdash; 2026
          </p>
          <h1 className="animate-fade-up animation-delay-200 font-serif text-6xl md:text-8xl font-light text-sumi leading-[0.95] tracking-tight">
            Fifty Years
            <span className="block italic text-4xl md:text-5xl mt-4 text-sumi-light">
              a book of memories for Takayasu Sensei
            </span>
          </h1>
          <p className="animate-fade-up animation-delay-300 mt-10 font-sans text-base md:text-lg leading-relaxed text-sumi-light max-w-xl">
            For half a century, Sensei has shared the teachings of Iwama with students across
            Australia. We are gathering photographs and words of thanks from everyone who has
            trained with him, to be presented to Sensei as a printed keepsake at the anniversary
            seminar.
          </p>
          <p className="animate-fade-up animation-delay-300 mt-6 font-sans text-sm font-semibold tracking-wide text-shu">
            Contributions close Saturday 10 October 2026.
          </p>
          <div className="animate-fade-up animation-delay-400 mt-10 flex flex-wrap gap-4">
            <a
              href="#contribute"
              className="inline-block bg-sumi text-washi font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-shu transition-colors duration-300"
            >
              Add your memory
            </a>
            <a
              href="#archive"
              className="inline-block border border-sumi/25 text-sumi font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:border-shu hover:text-shu transition-colors duration-300"
            >
              From the archive
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, kanji }: { eyebrow: string; title: string; kanji: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-12">
      <div>
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-shu font-semibold mb-4">{eyebrow}</p>
        <h2 className="font-serif text-4xl md:text-5xl font-medium text-sumi">{title}</h2>
        <div className="brush-rule mt-6" />
      </div>
      <span aria-hidden className="font-jp text-5xl md:text-6xl text-sumi/10 select-none">
        {kanji}
      </span>
    </div>
  );
}

/* ──────────────────────── ALBUM ──────────────────────── */
function Album({ photos }: { photos: AlbumPhoto[] }) {
  const [era, setEra] = useState<Era | "All">("All");
  const [open, setOpen] = useState<number | null>(null);

  const eras = useMemo(() => ERAS.filter((e) => photos.some((p) => p.era === e)), [photos]);
  const visible = era === "All" ? photos : photos.filter((p) => p.era === era);

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  const current = open === null ? null : visible[open];

  return (
    <section id="archive" className="py-24 md:py-32 bg-washi">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="From the dojo archive" title="A few memories to begin" kanji="写真" />
        <p className="font-sans text-base leading-relaxed text-sumi-light max-w-2xl -mt-4 mb-12">
          A small selection from the club&apos;s archive. The full album is being gathered now &mdash; your
          photographs will join these in the book presented to Sensei.
        </p>

        {eras.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {(["All", ...eras] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEra(e)}
                className={`font-sans text-xs tracking-[0.15em] uppercase px-4 py-2 border transition-colors ${
                  era === e
                    ? "bg-sumi border-sumi text-washi"
                    : "border-sumi/15 text-sumi-light hover:border-shu hover:text-shu"
                }`}
              >
                {e === "Undated" ? "Archive" : e}
              </button>
            ))}
          </div>
        )}

        {(era === "All" ? eras : [era]).map((group) => (
          <div key={group} className="mb-14 last:mb-0">
            {era === "All" && eras.length > 1 && (
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-sans text-xs tracking-[0.3em] uppercase text-shu font-semibold shrink-0">
                  {group === "Undated" ? "From the archive" : group}
                </h3>
                <div className="h-px flex-1 bg-sumi/10" />
              </div>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {visible.map((p, i) =>
                p.era !== group ? null : (
                  <figure key={p.url} className="break-inside-avoid mb-6">
                    <button
                      onClick={() => setOpen(i)}
                      className="block w-full bg-white p-2.5 pb-3 shadow-[0_1px_2px_rgba(35,31,27,0.08),0_8px_24px_-12px_rgba(35,31,27,0.25)] hover:-translate-y-0.5 transition-transform duration-300"
                      aria-label={`Open photo: ${p.caption || "untitled"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoSrc(p.url)}
                        alt={p.caption}
                        loading="lazy"
                        className="w-full h-auto block"
                        style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}
                      />
                    </button>
                    <figcaption className="mt-3 px-1">
                      {p.caption && <p className="font-serif italic text-lg leading-snug text-sumi">{p.caption}</p>}
                      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-sumi-light mt-1">{p.credit}</p>
                    </figcaption>
                  </figure>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 bg-sumi/95 flex flex-col items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc(current.url)}
            alt={current.caption}
            className="max-h-[80vh] max-w-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-5 text-center max-w-2xl" onClick={(e) => e.stopPropagation()}>
            {current.caption && <p className="font-serif italic text-xl text-washi">{current.caption}</p>}
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-washi/60 mt-2">
              {current.era !== "Undated" && <>{current.era} &middot; </>}
              {current.credit}
            </p>
          </div>
          {[
            [-1, "left-3 md:left-8", "M15.75 19.5L8.25 12l7.5-7.5", "Previous"],
            [1, "right-3 md:right-8", "M8.25 4.5l7.5 7.5-7.5 7.5", "Next"],
          ].map(([dir, pos, d, label]) => (
            <button
              key={label as string}
              onClick={(e) => {
                e.stopPropagation();
                step(dir as 1 | -1);
              }}
              className={`absolute top-1/2 -translate-y-1/2 ${pos} w-11 h-11 rounded-full border border-washi/30 text-washi hover:bg-washi hover:text-sumi transition-colors flex items-center justify-center`}
              aria-label={`${label} photo`}
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d={d as string} />
              </svg>
            </button>
          ))}
          <button
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 font-sans text-xs tracking-[0.2em] uppercase text-washi/70 hover:text-washi"
          >
            Close
          </button>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────── MESSAGES ──────────────────────── */
function MemoryModal({ memory, onClose }: { memory: PublicMemory; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-sumi/90 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="bg-washi max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 font-sans text-xs tracking-[0.2em] uppercase text-sumi-light hover:text-shu"
        >
          Close
        </button>
        {memory.photos.length > 0 && (
          <div className={`grid gap-4 mb-8 ${memory.photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {memory.photos.map((ph) => (
              <figure key={ph.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoSrc(ph.url)} alt={ph.caption} className="w-full h-auto bg-white p-2 shadow-sm" />
                {ph.caption && <figcaption className="font-serif italic text-base text-sumi mt-2">{ph.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
        {memory.message && (
          <p className="font-serif text-xl leading-relaxed text-sumi whitespace-pre-line">{memory.message}</p>
        )}
        <p className="font-sans text-sm font-semibold tracking-wide text-sumi mt-6">{memory.name}</p>
        {attributionText(memory) && <p className="font-sans text-xs text-sumi-light mt-1">{attributionText(memory)}</p>}
      </div>
    </div>
  );
}

/** Approved memories in a horizontal, swipeable row so the page stays short and the form stays close. */
function Memories({ memories }: { memories: PublicMemory[] }) {
  const items = memories.filter((m) => m.message || m.photos.length);
  const trackRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<PublicMemory | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id="memories" className="py-24 md:py-28 washi-texture border-y border-sumi/10">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="In their words" title="Memories so far" kanji="言葉" />

        {items.length === 0 ? (
          <p className="font-serif italic text-2xl text-sumi-light max-w-xl">
            The first memories will appear here soon.{" "}
            <a href="#contribute" className="text-shu underline underline-offset-4 decoration-1">
              Be the first to share one.
            </a>
          </p>
        ) : (
          <>
            <div className="relative">
              <div
                ref={trackRef}
                onScroll={updateEdges}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-6 pb-4 -mx-6 px-6 [scrollbar-width:thin]"
                role="region"
                aria-label="Approved memories"
                tabIndex={0}
              >
                {items.map((m) => {
                  const cover = m.photos[0];
                  return (
                    <button
                      key={m.id}
                      onClick={() => setOpen(m)}
                      className="snap-start shrink-0 w-[82vw] sm:w-[320px] h-[440px] text-left bg-white/80 border border-sumi/10 flex flex-col overflow-hidden hover:border-shu/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {cover && (
                        <div className="relative h-52 shrink-0 bg-washi-dark">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoSrc(cover.url)} alt={cover.caption} loading="lazy" className="w-full h-full object-cover" />
                          {m.photos.length > 1 && (
                            <span className="absolute bottom-2 right-2 bg-sumi/80 text-washi font-sans text-[11px] tracking-wide px-2 py-1">
                              +{m.photos.length - 1} {m.photos.length === 2 ? "photo" : "photos"}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-h-0 p-6 flex flex-col">
                        {m.message ? (
                          <p className={`font-serif text-lg leading-relaxed text-sumi ${cover ? "line-clamp-3" : "line-clamp-[10]"}`}>
                            &ldquo;{m.message}&rdquo;
                          </p>
                        ) : (
                          cover?.caption && <p className="font-serif italic text-lg text-sumi line-clamp-3">{cover.caption}</p>
                        )}
                        <div className="mt-auto pt-4 border-t border-sumi/10">
                          <p className="font-sans text-sm font-semibold tracking-wide text-sumi truncate">{m.name}</p>
                          {attributionText(m) && <p className="font-sans text-xs text-sumi-light mt-0.5 truncate">{attributionText(m)}</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!edges.end && (
                <div aria-hidden className="pointer-events-none absolute -right-6 top-0 bottom-4 w-16 bg-gradient-to-l from-washi to-transparent" />
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {([
                  [-1, "M15.75 19.5L8.25 12l7.5-7.5", "Previous", edges.start],
                  [1, "M8.25 4.5l7.5 7.5-7.5 7.5", "Next", edges.end],
                ] as const).map(([dir, d, label, disabled]) => (
                  <button
                    key={label}
                    onClick={() => scrollBy(dir)}
                    disabled={disabled}
                    aria-label={`${label} memories`}
                    className="w-11 h-11 rounded-full border border-sumi/20 text-sumi flex items-center justify-center hover:border-shu hover:text-shu transition-colors disabled:opacity-30 disabled:hover:border-sumi/20 disabled:hover:text-sumi"
                  >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                    </svg>
                  </button>
                ))}
                <span className="self-center font-sans text-xs text-sumi-light ml-2">
                  {items.length} {items.length === 1 ? "memory" : "memories"} &middot; tap one to read in full
                </span>
              </div>
              <a
                href="#contribute"
                className="inline-block bg-sumi text-washi font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-shu transition-colors duration-300"
              >
                Add your memory
              </a>
            </div>
          </>
        )}
      </div>
      {open && <MemoryModal memory={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

/* ──────────────────────── FOOTER ──────────────────────── */
function Footer() {
  return (
    <footer className="bg-sumi text-washi py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="font-jp text-2xl tracking-[0.12em] text-washi/80">感謝します</p>
        <p className="font-serif italic text-3xl md:text-4xl mt-6">Dōmo arigatō gozaimasu.</p>
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-washi/50 mt-10">
          Takemusu Aiki Association Inc. &middot;{" "}
          <a href="/" className="hover:text-washi">
            50th Anniversary Seminar
          </a>{" "}
          &middot;{" "}
          <a href="mailto:aikido@aikidoaus.com.au" className="hover:text-washi">
            aikido@aikidoaus.com.au
          </a>
        </p>
      </div>
    </footer>
  );
}

export function MemoriesView({ memories }: { memories: PublicMemory[] }) {
  // Only archive photos are shown publicly as examples; contributed photos go into the printed book.
  const photos = useMemo(() => collectPhotos([]), []);
  return (
    <main className="bg-washi text-sumi">
      <Header />
      <Hero />
      <Album photos={photos} />
      <Memories memories={memories} />
      <ContributeForm />
      <Footer />
    </main>
  );
}
