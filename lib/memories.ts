import type { Memory, MemoryPhoto, MemoryStatus, NewMemory } from "./memories-shared";

export * from "./memories-shared";

// In-memory store (used when no Postgres is configured)
const memoryStore: Memory[] = [];
let memoryId = 0;

function hasPostgres(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

/**
 * Where contributions and photos are being kept. On Vercel, the in-memory and inline
 * fallbacks would silently lose data, so routes refuse to accept uploads instead.
 */
export function storageStatus() {
  const onVercel = !!process.env.VERCEL;
  const database = hasPostgres() ? "postgres" : "memory";
  const photos = process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "inline";
  return {
    database,
    photos,
    environment: process.env.VERCEL_ENV || "local",
    durable: database === "postgres" && photos === "blob",
    acceptingUploads: !onVercel || (database === "postgres" && photos === "blob"),
  } as const;
}

async function getSQL() {
  const { sql } = await import("@vercel/postgres");
  return sql;
}

let initialised = false;
async function initDB() {
  if (initialised) return;
  const sql = await getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS memories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      dojo TEXT DEFAULT '',
      since_year TEXT DEFAULT '',
      message TEXT DEFAULT '',
      photos JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  initialised = true;
}

function normalise(row: Record<string, unknown>): Memory {
  return {
    ...(row as unknown as Memory),
    photos: (typeof row.photos === "string" ? JSON.parse(row.photos) : row.photos) as MemoryPhoto[],
    created_at: new Date(row.created_at as string).toISOString(),
  };
}

export async function addMemory(input: NewMemory): Promise<Memory> {
  if (!hasPostgres()) {
    const entry: Memory = { ...input, id: ++memoryId, status: "pending", created_at: new Date().toISOString() };
    memoryStore.push(entry);
    return entry;
  }
  await initDB();
  const sql = await getSQL();
  const result = await sql`
    INSERT INTO memories (name, email, dojo, since_year, message, photos)
    VALUES (${input.name}, ${input.email}, ${input.dojo}, ${input.since_year}, ${input.message}, ${JSON.stringify(input.photos)}::jsonb)
    RETURNING *
  `;
  return normalise(result.rows[0]);
}

export async function getMemories(status?: MemoryStatus): Promise<Memory[]> {
  if (!hasPostgres()) {
    return memoryStore.filter((m) => !status || m.status === status);
  }
  await initDB();
  const sql = await getSQL();
  const result = status
    ? await sql`SELECT * FROM memories WHERE status = ${status} ORDER BY created_at ASC`
    : await sql`SELECT * FROM memories ORDER BY created_at DESC`;
  return result.rows.map(normalise);
}

export async function updateMemory(
  id: number,
  patch: Partial<Pick<Memory, "status" | "message" | "photos" | "name" | "dojo" | "since_year">>
): Promise<Memory | null> {
  if (!hasPostgres()) {
    const entry = memoryStore.find((m) => m.id === id);
    if (!entry) return null;
    Object.assign(entry, patch);
    return entry;
  }
  await initDB();
  const sql = await getSQL();
  const existing = await sql`SELECT * FROM memories WHERE id = ${id}`;
  if (!existing.rows[0]) return null;
  const merged = { ...normalise(existing.rows[0]), ...patch };
  const result = await sql`
    UPDATE memories SET
      status = ${merged.status},
      name = ${merged.name},
      dojo = ${merged.dojo},
      since_year = ${merged.since_year},
      message = ${merged.message},
      photos = ${JSON.stringify(merged.photos)}::jsonb
    WHERE id = ${id}
    RETURNING *
  `;
  return normalise(result.rows[0]);
}

export async function deleteMemory(id: number): Promise<Memory | null> {
  if (!hasPostgres()) {
    const idx = memoryStore.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    return memoryStore.splice(idx, 1)[0];
  }
  await initDB();
  const sql = await getSQL();
  const result = await sql`DELETE FROM memories WHERE id = ${id} RETURNING *`;
  return result.rows[0] ? normalise(result.rows[0]) : null;
}

export function isAdmin(request: Request): boolean {
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  return provided === password;
}
