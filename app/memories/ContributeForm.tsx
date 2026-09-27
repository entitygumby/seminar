"use client";

import { useState } from "react";
import { ERAS, type Era } from "@/lib/memories-shared";

const MAX_PHOTOS = 6;
const MAX_MESSAGE = 1200;
// 2800px on the long edge prints a full A4 page at ~340 dpi.
const MAX_EDGE = 2800;
const LOW_RES_EDGE = 1200;

interface DraftPhoto {
  key: string;
  preview: string;
  url?: string;
  width: number;
  height: number;
  caption: string;
  era: Era;
  lowRes: boolean;
  status: "uploading" | "ready" | "error";
  error?: string;
}

async function resize(file: File): Promise<{ blob: Blob; width: number; height: number; original: number }> {
  const bitmap = await createImageBitmap(file);
  const original = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_EDGE / original);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", 0.88)
  );
  return { blob, width, height, original };
}

const inputClass =
  "w-full bg-white border border-sumi/15 px-4 py-3 font-sans text-base text-sumi placeholder:text-sumi-light/50 transition-colors";
const labelClass = "block font-sans text-xs tracking-[0.15em] uppercase text-sumi-light font-semibold mb-2";

export function ContributeForm() {
  const [form, setForm] = useState({ name: "", email: "", dojo: "", since_year: "", message: "", website: "" });
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const patchPhoto = (key: string, patch: Partial<DraftPhoto>) =>
    setPhotos((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    for (const file of Array.from(files).slice(0, room)) {
      const key = `${file.name}-${file.lastModified}-${Math.random()}`;
      const draft: DraftPhoto = {
        key,
        preview: URL.createObjectURL(file),
        width: 0,
        height: 0,
        caption: "",
        era: "Undated",
        lowRes: false,
        status: "uploading",
      };
      setPhotos((ps) => [...ps, draft]);

      try {
        const { blob, width, height, original } = await resize(file);
        const body = new FormData();
        body.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        const res = await fetch("/api/memories/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        patchPhoto(key, { url: data.url, width, height, lowRes: original < LOW_RES_EDGE, status: "ready" });
      } catch (err) {
        patchPhoto(key, {
          status: "error",
          error:
            err instanceof Error && err.message !== "Upload failed"
              ? err.message
              : "This photo couldn't be uploaded. If it's an iPhone HEIC file, try exporting it as JPEG.",
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (photos.some((p) => p.status === "uploading")) {
      setError("Please wait for your photos to finish uploading.");
      return;
    }
    const ready = photos.filter((p) => p.status === "ready");
    if (!form.message.trim() && ready.length === 0) {
      setError("Please write a message or add at least one photo.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          consent,
          photos: ready.map(({ url, caption, era, width, height }) => ({ url, caption, era, width, height })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contribute" className="py-24 md:py-32 bg-washi">
      <div className="max-w-3xl mx-auto px-6">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-shu font-semibold mb-4">Contribute</p>
        <h2 className="font-serif text-4xl md:text-5xl font-medium text-sumi">Add your memory</h2>
        <div className="brush-rule mt-6 mb-8" />
        <p className="font-sans text-base leading-relaxed text-sumi-light mb-12">
          Whether you trained with Sensei for one seminar or forty years, we&apos;d love to include you.
          Share a photograph, a few words of thanks, or both. Each contribution is reviewed by the
          committee before it appears here and in the printed book presented to Sensei.
        </p>

        {done ? (
          <div className="bg-white border border-sumi/10 p-10 text-center">
            <p className="font-jp text-3xl text-shu">感謝</p>
            <p className="font-serif text-3xl text-sumi mt-4">Thank you</p>
            <p className="font-sans text-sumi-light mt-4 leading-relaxed">
              Your contribution has been received. It will appear in the album once the committee has
              reviewed it.
            </p>
            <button
              onClick={() => {
                setDone(false);
                setPhotos([]);
                setConsent(false);
                setForm((f) => ({ ...f, message: "" }));
              }}
              className="mt-8 font-sans text-xs tracking-[0.2em] uppercase text-shu underline underline-offset-4"
            >
              Add another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={set("website")}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
            />

            <fieldset className="space-y-5">
              <legend className="font-serif text-2xl text-sumi mb-5">About you</legend>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="m-name">Name *</label>
                  <input id="m-name" required className={inputClass} value={form.name} onChange={set("name")} placeholder="As you'd like it printed" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="m-email">Email *</label>
                  <input id="m-email" required type="email" className={inputClass} value={form.email} onChange={set("email")} placeholder="Never shown publicly" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="m-dojo">Dojo</label>
                  <input id="m-dojo" className={inputClass} value={form.dojo} onChange={set("dojo")} placeholder="e.g. Pymble Dojo" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="m-since">Trained with Sensei since</label>
                  <input
                    id="m-since"
                    inputMode="numeric"
                    pattern="(19|20)[0-9]{2}"
                    maxLength={4}
                    className={inputClass}
                    value={form.since_year}
                    onChange={set("since_year")}
                    placeholder="Year, e.g. 1988"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-serif text-2xl text-sumi mb-5">A message to Sensei</legend>
              <textarea
                rows={7}
                maxLength={MAX_MESSAGE}
                className={`${inputClass} font-serif text-lg leading-relaxed`}
                value={form.message}
                onChange={set("message")}
                placeholder="A memory from the mat, a lesson that stayed with you, or simply your thanks…"
              />
              <p className="font-sans text-xs text-sumi-light mt-2 text-right">
                {form.message.length} / {MAX_MESSAGE}
              </p>
            </fieldset>

            <fieldset>
              <legend className="font-serif text-2xl text-sumi mb-2">Photographs</legend>
              <p className="font-sans text-sm text-sumi-light mb-5">
                Up to {MAX_PHOTOS} photos. Scans of old prints are especially welcome &mdash; the
                larger the file, the better it will print.
              </p>

              {photos.length > 0 && (
                <div className="space-y-4 mb-5">
                  {photos.map((p) => (
                    <div key={p.key} className="flex gap-4 bg-white border border-sumi/10 p-3">
                      <div className="relative w-28 h-28 shrink-0 bg-washi-dark overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.preview} alt="" className={`w-full h-full object-cover ${p.status === "uploading" ? "opacity-40" : ""}`} />
                        {p.status === "uploading" && (
                          <span className="absolute inset-0 flex items-center justify-center font-sans text-[10px] tracking-[0.2em] uppercase text-sumi">
                            Uploading
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        {p.status === "error" ? (
                          <p className="font-sans text-sm text-shu">{p.error}</p>
                        ) : (
                          <>
                            <input
                              className={`${inputClass} py-2 text-sm`}
                              placeholder="Caption — who, where, when?"
                              maxLength={200}
                              value={p.caption}
                              onChange={(e) => patchPhoto(p.key, { caption: e.target.value })}
                            />
                            <select
                              className={`${inputClass} py-2 text-sm`}
                              value={p.era}
                              onChange={(e) => patchPhoto(p.key, { era: e.target.value as Era })}
                              aria-label="Decade"
                            >
                              {ERAS.map((era) => (
                                <option key={era} value={era}>
                                  {era === "Undated" ? "Not sure of the decade" : era}
                                </option>
                              ))}
                            </select>
                            {p.lowRes && (
                              <p className="font-sans text-xs text-sumi-light">
                                This image is quite small, so it may print at a reduced size.
                              </p>
                            )}
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setPhotos((ps) => ps.filter((x) => x.key !== p.key))}
                          className="font-sans text-xs tracking-[0.15em] uppercase text-sumi-light hover:text-shu"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < MAX_PHOTOS && (
                <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-sumi/25 bg-white/50 hover:border-shu hover:bg-white py-10 cursor-pointer transition-colors">
                  <span className="font-serif text-xl text-sumi">Choose photos</span>
                  <span className="font-sans text-xs text-sumi-light">JPEG or PNG</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </fieldset>

            <label className="flex gap-3 items-start cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#A93226]"
              />
              <span className="font-sans text-sm leading-relaxed text-sumi-light">
                I took these photos or have permission to share them, and I&apos;m happy for my name,
                message and photos to be published on this page and printed in the keepsake book for
                Takayasu Sensei. *
              </span>
            </label>

            {error && <p className="font-sans text-sm text-shu">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-sumi text-washi font-sans text-sm font-semibold tracking-widest uppercase px-12 py-4 hover:bg-shu transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send to the committee"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
