"use client";

import { useState, useCallback } from "react";

interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  dojo: string;
  rank: string;
  registration_type: string;
  attend_dinner: boolean;
  dietary_requirements: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(password);
  };

  const handleRefresh = () => {
    fetchRegistrations(storedPassword);
  };

  const handleCSVExport = () => {
    window.open(`/api/registrations?password=${encodeURIComponent(storedPassword)}&format=csv`, "_blank");
  };

  const dinnerCount = registrations.filter((r) => r.attend_dinner).length;
  const bothDaysCount = registrations.filter((r) => r.registration_type === "both").length;
  const satOnlyCount = registrations.filter((r) => r.registration_type === "saturday").length;
  const sunOnlyCount = registrations.filter((r) => r.registration_type === "sunday").length;
  const observerCount = registrations.filter((r) => r.registration_type === "observer").length;

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
      {/* Header */}
      <header className="border-b border-ink/10 bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-ink">Seminar Registrations</h1>
            <p className="font-sans text-xs text-ink-light">50th Anniversary Seminar — Takayasu Sensei</p>
          </div>
          <div className="flex gap-3">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Total</p>
            <p className="font-serif text-3xl font-bold text-crimson">{registrations.length}</p>
            <p className="font-sans text-xs text-ink-light">of 100 spots</p>
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
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Observers</p>
            <p className="font-serif text-3xl font-bold text-ink">{observerCount}</p>
            <p className="font-sans text-xs text-ink-light">observer passes</p>
          </div>
          <div className="bg-white border border-ink/10 p-5">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold mb-1">Dinner</p>
            <p className="font-serif text-3xl font-bold text-ink">{dinnerCount}</p>
            <p className="font-sans text-xs text-ink-light">attending dinner</p>
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
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Name</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Email</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Phone</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Dojo</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Rank</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Type</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Dinner</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Diet</th>
                  <th className="text-left font-sans text-xs tracking-[0.15em] uppercase text-warm-gray font-semibold px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, i) => (
                  <tr key={reg.id} className="border-b border-ink/5 hover:bg-parchment/50 transition-colors">
                    <td className="px-4 py-3 font-sans text-xs text-warm-gray">{i + 1}</td>
                    <td className="px-4 py-3 font-sans text-sm font-medium text-ink">{reg.name}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.email}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.phone || "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.dojo || "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">{reg.rank || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block font-sans text-xs font-semibold tracking-wider uppercase px-2 py-1 ${
                        reg.registration_type === "observer"
                          ? "bg-ink/5 text-ink-light"
                          : reg.registration_type === "both"
                          ? "bg-crimson/10 text-crimson"
                          : "bg-crimson/5 text-crimson-dark"
                      }`}>
                        {reg.registration_type === "both" ? "Both Days" : reg.registration_type === "saturday" ? "Sat Only" : reg.registration_type === "sunday" ? "Sun Only" : "Observer"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-ink-light">
                      {reg.attend_dinner ? "Yes" : "No"}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
