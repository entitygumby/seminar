export interface Registration {
  id?: number;
  name: string;
  email: string;
  phone: string;
  dojo: string;
  rank: string;
  registration_type: string;
  attend_dinner: boolean;
  dietary_requirements: string;
  created_at?: string;
}

// In-memory store (used when no Postgres is configured)
const memoryStore: Registration[] = [];
let memoryId = 0;

// Check if Postgres is available
function hasPostgres(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

async function getSQL() {
  const { sql } = await import("@vercel/postgres");
  return sql;
}

export async function initDB() {
  if (!hasPostgres()) return;

  try {
    const sql = await getSQL();
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT '',
        dojo TEXT DEFAULT '',
        rank TEXT DEFAULT '',
        registration_type TEXT DEFAULT 'both',
        attend_dinner BOOLEAN DEFAULT FALSE,
        dietary_requirements TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (error) {
    console.error("Failed to init Postgres, falling back to memory store:", error);
  }
}

export async function addRegistration(reg: Omit<Registration, "id" | "created_at">): Promise<Registration> {
  if (!hasPostgres()) {
    const entry: Registration = {
      ...reg,
      id: ++memoryId,
      created_at: new Date().toISOString(),
    };
    memoryStore.push(entry);
    return entry;
  }

  try {
    await initDB();
    const sql = await getSQL();

    const result = await sql`
      INSERT INTO registrations (name, email, phone, dojo, rank, registration_type, attend_dinner, dietary_requirements)
      VALUES (${reg.name}, ${reg.email}, ${reg.phone}, ${reg.dojo}, ${reg.rank}, ${reg.registration_type}, ${reg.attend_dinner}, ${reg.dietary_requirements})
      RETURNING *
    `;

    return result.rows[0] as Registration;
  } catch (error) {
    console.error("Postgres insert failed, using memory store:", error);
    // Fallback to memory
    const entry: Registration = {
      ...reg,
      id: ++memoryId,
      created_at: new Date().toISOString(),
    };
    memoryStore.push(entry);
    return entry;
  }
}

export async function getRegistrations(): Promise<Registration[]> {
  if (!hasPostgres()) {
    return [...memoryStore].reverse();
  }

  try {
    await initDB();
    const sql = await getSQL();

    const result = await sql`
      SELECT * FROM registrations ORDER BY created_at DESC
    `;

    return result.rows as Registration[];
  } catch (error) {
    console.error("Postgres query failed, returning memory store:", error);
    return [...memoryStore].reverse();
  }
}

export async function getRegistrationCount(): Promise<number> {
  if (!hasPostgres()) {
    return memoryStore.length;
  }

  try {
    await initDB();
    const sql = await getSQL();

    const result = await sql`SELECT COUNT(*) as count FROM registrations`;
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error("Postgres count failed, returning memory count:", error);
    return memoryStore.length;
  }
}
