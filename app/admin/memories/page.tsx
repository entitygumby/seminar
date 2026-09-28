"use client";

import { useCallback, useState } from "react";
import { ERAS, photoSrc, type Era, type Memory, type MemoryStatus } from "@/lib/memories-shared";
import { LOW_RES_PX } from "../../memories/print/specs";

const TABS: { key: MemoryStatus; label: string }[] = [
  { key: "pending", label: "Awaiting review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function MemoryCard({
  memory,
  onSave,
  onDelete,
  busy,
}: {
  memory: Memory;
  onSave: (patch: Partial<Memory>) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(memory);
  const dirty = JSON.stringify(draft) !== JSON.stringify(memory);

  return (
    <article className="bg-white border border-slate-200 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <div>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="font-serif text-2xl font-semibold text-ink border-b border-transparent hover:border-slate-200 bg-transparent"
          />
          <p className="font-sans text-sm text-ink-light">
            <a href={`mailto:${memory.email}`} className="hover:text-crimson">{memory.email}</a>
            {memory.dojo && <> &middot; {memory.dojo}</>}
            {memory.since_year && <> &middot; since {memory.since_year}</>}
          </p>
        </div>
        <p className="font-sans text-xs text-warm-gray">
          {new Date(memory.created_at).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </div>

      {memory.message && (
        <textarea
          value={draft.message}
          onChange={(e) => setDraft({ ...draft, message: e.target.value })}
          rows={Math.min(10, Math.max(3, Math.ceil(draft.message.length / 90)))}
          className="w-full font-serif text-lg leading-relaxed border border-slate-200 p-3 mb-4"
        />
      )}

      {draft.photos.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {draft.photos.map((p, i) => {
            const setPhoto = (patch: Partial<typeof p>) =>
              setDraft({ ...draft, photos: draft.photos.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <div key={p.url} className="border border-slate-200 p-2 space-y-2">
                <a href={photoSrc(p.url)} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoSrc(p.url)} alt={p.caption} className="w-full h-40 object-cover bg-slate-100" />
                </a>
                <p className="font-sans text-[11px] text-warm-gray">
                  {p.width}×{p.height}px{Math.max(p.width, p.height) < LOW_RES_PX && " · may print soft"}
                </p>
                <input
                  value={p.caption}
                  onChange={(e) => setPhoto({ caption: e.target.value })}
                  placeholder="Caption"
                  className="w-full font-sans text-sm border border-slate-200 px-2 py-1"
                />
                <div className="flex gap-2">
                  <select
                    value={p.era}
                    onChange={(e) => setPhoto({ era: e.target.value as Era })}
                    className="flex-1 font-sans text-sm border border-slate-200 px-2 py-1"
                  >
                    {ERAS.map((era) => (
                      <option key={era}>{era}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setDraft({ ...draft, photos: draft.photos.filter((_, j) => j !== i) })}
                    className="font-sans text-xs text-ink-light hover:text-crimson px-2"
                    title="Remove this photo from the contribution"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {memory.status !== "approved" && (
          <button
            disabled={busy}
            onClick={() => onSave({ ...draft, status: "approved" })}
            className="bg-green-700 text-white font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 hover:bg-green-800 disabled:opacity-50"
          >
            {dirty ? "Save & approve" : "Approve"}
          </button>
        )}
        {dirty && (
          <button
            disabled={busy}
            onClick={() => onSave(draft)}
            className="bg-ink text-white font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 hover:bg-ink/80 disabled:opacity-50"
          >
            Save edits
          </button>
        )}
        {memory.status !== "rejected" && (
          <button
            disabled={busy}
            onClick={() => onSave({ status: "rejected" })}
            className="border border-slate-300 text-ink-light font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 hover:border-crimson hover:text-crimson disabled:opacity-50"
          >
            {memory.status === "approved" ? "Unpublish" : "Reject"}
          </button>
        )}
        {memory.status === "rejected" && (
          <button
            disabled={busy}
            onClick={() => {
              if (confirm(`Permanently delete ${memory.name}'s contribution and photos?`)) onDelete();
            }}
            className="border border-crimson/40 text-crimson font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 hover:bg-crimson hover:text-white disabled:opacity-50"
          >
            Delete permanently
          </button>
        )}
      </div>
    </article>
  );
}

export default function MemoriesAdmin() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [storage, setStorage] = useState<{ database: string; photos: string; environment: string; durable: boolean } | null>(null);
  const [tab, setTab] = useState<MemoryStatus>("pending");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async (pw: string) => {
    setError("");
    const res = await fetch("/api/memories/admin", { headers: { Authorization: `Bearer ${pw}` } });
    if (!res.ok) {
      setError(res.status === 401 ? "Invalid password" : "Failed to load contributions");
      return;
    }
    const data = await res.json();
    setMemories(data.memories);
    setStorage(data.storage);
    setToken(pw);
  }, []);

  async function save(id: number, patch: Partial<Memory>) {
    setBusy(id);
    const res = await fetch(`/api/memories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const { memory } = await res.json();
      setMemories((ms) => ms.map((m) => (m.id === id ? memory : m)));
    } else setError("Save failed");
    setBusy(null);
  }

  async function remove(id: number) {
    setBusy(id);
    const res = await fetch(`/api/memories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setMemories((ms) => ms.filter((m) => m.id !== id));
    else setError("Delete failed");
    setBusy(null);
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-parchment-dark px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          className="bg-white border border-slate-200 p-10 w-full max-w-sm"
        >
          <h1 className="font-serif text-3xl font-bold text-ink mb-6">Memories — Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full border border-slate-200 px-4 py-3 font-sans mb-4"
          />
          {error && <p className="font-sans text-sm text-crimson mb-4">{error}</p>}
          <button className="w-full bg-crimson text-white font-sans text-sm font-semibold tracking-widest uppercase py-3">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const shown = memories.filter((m) => m.status === tab);
  const approved = memories.filter((m) => m.status === "approved");

  return (
    <main className="min-h-screen bg-parchment-dark">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-ink">Memories</h1>
            <p className="font-sans text-sm text-ink-light mt-1">
              {approved.length} approved &middot; {approved.reduce((n, m) => n + m.photos.length, 0)} photos in the book
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/admin" className="font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 border border-slate-300 text-ink-light hover:text-crimson">
              Registrations
            </a>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), memories }, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `memories-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 border border-slate-300 text-ink-light hover:text-crimson"
            >
              Download backup
            </button>
            <a href="/memories" target="_blank" className="font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 border border-slate-300 text-ink-light hover:text-crimson">
              View album
            </a>
            <a href="/memories/print" target="_blank" className="font-sans text-xs font-semibold tracking-widest uppercase px-4 py-2 bg-crimson text-white hover:bg-crimson-dark">
              Print edition
            </a>
          </div>
        </div>

        {storage && (
          <div
            className={`mb-6 border px-4 py-3 font-sans text-sm ${
              storage.durable ? "border-green-700/30 bg-green-50 text-green-900" : "border-crimson/40 bg-red-50 text-crimson"
            }`}
          >
            <strong>{storage.durable ? "Storage connected" : "Storage NOT connected — contributions are not being saved permanently"}</strong>
            <span className="block mt-1 text-xs">
              Environment: {storage.environment} &middot; Contributions:{" "}
              {storage.database === "postgres" ? "Postgres database ✓" : "temporary memory ✗ (connect a Postgres database)"} &middot; Photos:{" "}
              {storage.photos === "blob" ? "Vercel Blob ✓" : "not stored ✗ (connect a Blob store)"}
            </span>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-sans text-sm px-4 py-3 -mb-px border-b-2 ${
                tab === t.key ? "border-crimson text-crimson font-semibold" : "border-transparent text-ink-light"
              }`}
            >
              {t.label} ({memories.filter((m) => m.status === t.key).length})
            </button>
          ))}
          <button onClick={() => load(token)} className="ml-auto font-sans text-xs text-ink-light hover:text-crimson">
            Refresh
          </button>
        </div>

        {error && <p className="font-sans text-sm text-crimson mb-4">{error}</p>}

        <div className="space-y-6">
          {shown.length === 0 ? (
            <p className="font-sans text-ink-light">Nothing here.</p>
          ) : (
            shown.map((m) => (
              <MemoryCard
                key={`${m.id}-${m.status}`}
                memory={m}
                busy={busy === m.id}
                onSave={(patch) => save(m.id, patch)}
                onDelete={() => remove(m.id)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
