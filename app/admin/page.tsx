"use client";

import { useState, useCallback, useEffect } from "react";
import { getAdminPassword, setAdminPassword } from "@/lib/adminSession";

interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  dojo: string;
  rank: string;
  registration_type: string;
  attend_dinner: boolean;
  lunch_saturday: boolean;
  lunch_sunday: boolean;
  dietary_requirements: string;
  paid: boolean;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "both", label: "Both Days" },
  { value: "saturday", label: "Saturday Only" },
  { value: "sunday", label: "Sunday Only" },
  { value: "dinner_only", label: "Dinner Only" },
];

const fieldLabel = "block font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1";
const fieldInput = "w-full border border-ink/20 bg-white font-sans text-sm px-3 py-2";

function EditRegistrationModal({
  registration,
  password,
  onSaved,
  onClose,
}: {
  registration: Registration;
  password: string;
  onSaved: (updated: Registration) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(registration);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Registration>(field: K, value: Registration[K]) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const type = draft.registration_type;
  const canLunchSat = type === "both" || type === "saturday";
  const canLunchSun = type === "both" || type === "sunday";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/registrations/${registration.id}?password=${encodeURIComponent(password)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed. Please try again.");
      onSaved(data.registration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 bg-ink/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <h2 className="font-serif text-2xl font-bold text-ink">Edit Registration</h2>

        <div>
          <label className={fieldLabel}>Name *</label>
          <input required value={draft.name} onChange={(e) => set("name", e.target.value)} className={fieldInput} />
        </div>
        <div>
          <label className={fieldLabel}>Email *</label>
          <input required type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className={fieldInput} />
        </div>
        <div>
          <label className={fieldLabel}>Phone *</label>
          <input required type="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className={fieldInput} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={fieldLabel}>Dojo</label>
            <input value={draft.dojo} onChange={(e) => set("dojo", e.target.value)} className={fieldInput} />
          </div>
          <div>
            <label className={fieldLabel}>Rank</label>
            <input value={draft.rank} onChange={(e) => set("rank", e.target.value)} className={fieldInput} />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Registration Type</label>
          <select
            value={type}
            onChange={(e) => {
              const t = e.target.value;
              setDraft((prev) => ({
                ...prev,
                registration_type: t,
                attend_dinner: t === "dinner_only" ? true : prev.attend_dinner,
                lunch_saturday: t === "both" || t === "saturday" ? prev.lunch_saturday : false,
                lunch_sunday: t === "both" || t === "sunday" ? prev.lunch_sunday : false,
              }));
            }}
            className={fieldInput}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-3 font-sans text-sm text-ink-light">
            <input
              type="checkbox"
              checked={draft.attend_dinner}
              disabled={type === "dinner_only"}
              onChange={(e) => set("attend_dinner", e.target.checked)}
              className="w-4 h-4 accent-crimson"
            />
            Anniversary Dinner
          </label>
          <label className={`flex items-center gap-3 font-sans text-sm ${canLunchSat ? "text-ink-light" : "text-ink-light/40"}`}>
            <input
              type="checkbox"
              checked={draft.lunch_saturday}
              disabled={!canLunchSat}
              onChange={(e) => set("lunch_saturday", e.target.checked)}
              className="w-4 h-4 accent-crimson"
            />
            Saturday Lunch
          </label>
          <label className={`flex items-center gap-3 font-sans text-sm ${canLunchSun ? "text-ink-light" : "text-ink-light/40"}`}>
            <input
              type="checkbox"
              checked={draft.lunch_sunday}
              disabled={!canLunchSun}
              onChange={(e) => set("lunch_sunday", e.target.checked)}
              className="w-4 h-4 accent-crimson"
            />
            Sunday Lunch
          </label>
        </div>
        <div>
          <label className={fieldLabel}>Dietary Requirements</label>
          <textarea
            rows={2}
            value={draft.dietary_requirements}
            onChange={(e) => set("dietary_requirements", e.target.value)}
            className={fieldInput}
          />
        </div>

        {error && <p className="font-sans text-sm text-crimson">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs font-semibold tracking-widest uppercase border border-ink/20 px-4 py-2 hover:border-ink/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="font-sans text-xs font-semibold tracking-widest uppercase bg-ink text-white px-4 py-2 hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

type SortKey =
  | "name" | "email" | "phone" | "dojo" | "rank" | "registration_type"
  | "attend_dinner" | "lunch_saturday" | "lunch_sunday" | "dietary_requirements"
  | "created_at" | "paid";
type SortDir = "asc" | "desc";

// Yes/No and date columns start with Yes / newest first; text columns start A–Z.
const DESC_FIRST: SortKey[] = ["attend_dinner", "lunch_saturday", "lunch_sunday", "created_at", "paid"];
const TYPE_ORDER = ["both", "saturday", "sunday", "dinner_only"];

function sortRegistrations(list: Registration[], key: SortKey, dir: SortDir): Registration[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "boolean" || typeof bv === "boolean") return sign * (Number(!!av) - Number(!!bv));
    if (key === "registration_type") return sign * (TYPE_ORDER.indexOf(String(av)) - TYPE_ORDER.indexOf(String(bv)));
    if (key === "created_at") return sign * (new Date(String(av)).getTime() - new Date(String(bv)).getTime());
    const as = String(av ?? "").trim();
    const bs = String(bv ?? "").trim();
    // Blanks always go to the bottom, whichever direction.
    if (!as || !bs) return Number(!as) - Number(!bs);
    return sign * as.localeCompare(bs, "en-AU", { sensitivity: "base", numeric: true });
  });
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SortKey;
  sort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === column;
  return (
    <th
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className="text-left font-sans text-xs tracking-[0.15em] uppercase font-semibold px-4 py-3"
    >
      <button
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.15em] whitespace-nowrap hover:text-ink transition-colors ${
          active ? "text-ink" : "text-warm-gray"
        }`}
      >
        {label}
        <span className={active ? "" : "opacity-30"}>{active && sort.dir === "asc" ? "▲" : "▼"}</span>
      </button>
    </th>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [editing, setEditing] = useState<Registration | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "created_at", dir: "desc" });

  const handleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: DESC_FIRST.includes(key) ? "desc" : "asc" }
    );

  const fetchRegistrations = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/registrations?password=${encodeURIComponent(pw)}`);
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid password");
        throw new Error("Failed to fetch registrations");
      }
      const data = await res.json();
      setRegistrations(data.registrations);
      setAuthenticated(true);
      setStoredPassword(pw);
      setAdminPassword(pw);
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid password") setAdminPassword("");
      setError(err instanceof Error ? err.message : "Error");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reuse a sign-in from the Memories admin in this tab.
  useEffect(() => {
    const pw = getAdminPassword();
    if (pw) fetchRegistrations(pw).finally(() => setCheckingSession(false));
    else setCheckingSession(false);
  }, [fetchRegistrations]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(password);
  };

  const handleRefresh = () => fetchRegistrations(storedPassword);

  const handleCSVExport = () => {
    window.open(`/api/registrations?password=${encodeURIComponent(storedPassword)}&format=csv`, "_blank");
  };

  const handleTogglePaid = async (reg: Registration) => {
    setActionLoading(reg.id);
    const newPaid = !reg.paid;
    // Optimistic update
    setRegistrations((prev) =>
      prev.map((r) => (r.id === reg.id ? { ...r, paid: newPaid } : r))
    );
    try {
      const res = await fetch(
        `/api/registrations/${reg.id}?password=${encodeURIComponent(storedPassword)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paid: newPaid }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // Revert on failure
      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, paid: reg.paid } : r))
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reg: Registration) => {
    if (!confirm(`Delete registration for ${reg.name}? This cannot be undone.`)) return;
    setActionLoading(reg.id);
    try {
      const res = await fetch(
        `/api/registrations/${reg.id}?password=${encodeURIComponent(storedPassword)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const paidCount = registrations.filter((r) => r.paid).length;
  const dinnerCount = registrations.filter((r) => r.attend_dinner).length;
  const bothDaysCount = registrations.filter((r) => r.registration_type === "both").length;
  const satOnlyCount = registrations.filter((r) => r.registration_type === "saturday").length;
  const sunOnlyCount = registrations.filter((r) => r.registration_type === "sunday").length;
  const lunchSatCount = registrations.filter((r) => r.lunch_saturday).length;
  const lunchSunCount = registrations.filter((r) => r.lunch_sunday).length;

  if (!authenticated && checkingSession) {
    return <div className="min-h-screen bg-parchment" />;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-bold text-ink mb-2 text-center">Admin Access</h1>
          <p className="font-sans text-sm text-ink-light mb-8 text-center">
            Enter the admin password to view registrations.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-ink/20 bg-white font-sans text-sm px-4 py-3 mb-4"
          />
          {error && <p className="font-sans text-sm text-crimson mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <header className="border-b border-ink/10 bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-ink">Seminar Registrations</h1>
            <p className="font-sans text-xs text-ink-light">50th Anniversary Seminar — Takayasu Sensei</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/memories"
              className="font-sans text-xs font-semibold tracking-widest uppercase border border-ink/20 px-4 py-2 hover:border-ink/40 transition-colors"
            >
              Memories
            </a>
            <button
              onClick={handleRefresh}
              className="font-sans text-xs font-semibold tracking-widest uppercase border border-ink/20 px-4 py-2 hover:border-ink/40 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleCSVExport}
              className="font-sans text-xs font-semibold tracking-widest uppercase bg-ink text-white px-4 py-2 hover:bg-ink-light transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Total</p>
            <p className="font-serif text-3xl font-bold text-crimson">{registrations.length}</p>
            <p className="font-sans text-xs text-ink-light">of 50 spots</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Both Days</p>
            <p className="font-serif text-3xl font-bold text-ink">{bothDaysCount}</p>
            <p className="font-sans text-xs text-ink-light">full seminar</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Single Day</p>
            <p className="font-serif text-3xl font-bold text-ink">{satOnlyCount + sunOnlyCount}</p>
            <p className="font-sans text-xs text-ink-light">Sat {satOnlyCount} / Sun {sunOnlyCount}</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Dinner</p>
            <p className="font-serif text-3xl font-bold text-ink">{dinnerCount}</p>
            <p className="font-sans text-xs text-ink-light">attending dinner</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Sat Lunch</p>
            <p className="font-serif text-3xl font-bold text-ink">{lunchSatCount}</p>
            <p className="font-sans text-xs text-ink-light">Saturday lunch</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Sun Lunch</p>
            <p className="font-serif text-3xl font-bold text-ink">{lunchSunCount}</p>
            <p className="font-sans text-xs text-ink-light">Sunday lunch</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Paid</p>
            <p className="font-serif text-3xl font-bold text-ink">{paidCount}</p>
            <p className="font-sans text-xs text-ink-light">of {registrations.length} registered</p>
          </div>
        </div>

        {/* Table */}
        {registrations.length === 0 ? (
          <div className="text-center py-16 border border-ink/10 bg-white">
            <p className="font-sans text-sm text-ink-light">No registrations yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-ink/10 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/10 bg-parchment-dark">
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">#</th>
                  <SortHeader label="Name" column="name" sort={sort} onSort={handleSort} />
                  <SortHeader label="Email" column="email" sort={sort} onSort={handleSort} />
                  <SortHeader label="Phone" column="phone" sort={sort} onSort={handleSort} />
                  <SortHeader label="Dojo" column="dojo" sort={sort} onSort={handleSort} />
                  <SortHeader label="Rank" column="rank" sort={sort} onSort={handleSort} />
                  <SortHeader label="Type" column="registration_type" sort={sort} onSort={handleSort} />
                  <SortHeader label="Dinner" column="attend_dinner" sort={sort} onSort={handleSort} />
                  <SortHeader label="Sat Lunch" column="lunch_saturday" sort={sort} onSort={handleSort} />
                  <SortHeader label="Sun Lunch" column="lunch_sunday" sort={sort} onSort={handleSort} />
                  <SortHeader label="Diet" column="dietary_requirements" sort={sort} onSort={handleSort} />
                  <SortHeader label="Date" column="created_at" sort={sort} onSort={handleSort} />
                  <SortHeader label="Paid" column="paid" sort={sort} onSort={handleSort} />
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sortRegistrations(registrations, sort.key, sort.dir).map((reg, i) => (
                  <tr
                    key={reg.id}
                    className={`border-b border-ink/5 transition-colors ${
                      reg.paid ? "bg-green-50/40 hover:bg-green-50/60" : "hover:bg-parchment/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-sans text-xs text-warm-gray">{i + 1}</td>
                    <td className="px-4 py-3 font-sans text-sm font-medium text-ink whitespace-nowrap">{reg.name}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.email}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light whitespace-nowrap">{reg.phone || "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.dojo || "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light whitespace-nowrap">{reg.rank || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block font-sans text-xs font-semibold tracking-wider uppercase px-2 py-1 ${
                        reg.registration_type === "both"
                          ? "bg-crimson/10 text-crimson"
                          : reg.registration_type === "dinner_only"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-crimson/5 text-crimson-dark"
                      }`}>
                        {reg.registration_type === "both"
                          ? "Both Days"
                          : reg.registration_type === "saturday"
                          ? "Sat Only"
                          : reg.registration_type === "sunday"
                          ? "Sun Only"
                          : reg.registration_type === "dinner_only"
                          ? "Dinner Only"
                          : reg.registration_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">
                      {reg.attend_dinner ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">
                      {reg.lunch_saturday ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">
                      {reg.lunch_sunday ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.dietary_requirements || "—"}</td>
                    <td className="px-4 py-3 font-sans text-xs text-warm-gray whitespace-nowrap">
                      {new Date(reg.created_at || "").toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePaid(reg)}
                        disabled={actionLoading === reg.id}
                        className={`font-sans text-xs font-semibold tracking-wider uppercase px-3 py-1.5 border transition-all duration-200 disabled:opacity-40 ${
                          reg.paid
                            ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700"
                            : "border-ink/20 text-ink-light hover:border-ink/40 hover:text-ink"
                        }`}
                      >
                        {reg.paid ? "Paid ✓" : "Unpaid"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(reg)}
                          disabled={actionLoading === reg.id}
                          className="font-sans text-xs font-semibold tracking-wider uppercase px-3 py-1.5 border border-ink/20 text-ink-light hover:border-ink/40 hover:text-ink transition-all duration-200 disabled:opacity-40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(reg)}
                          disabled={actionLoading === reg.id}
                          className="font-sans text-xs font-semibold tracking-wider uppercase px-3 py-1.5 border border-crimson/30 text-crimson hover:bg-crimson hover:text-white transition-all duration-200 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <EditRegistrationModal
          registration={editing}
          password={storedPassword}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
