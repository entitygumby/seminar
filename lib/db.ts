import { sql } from "@vercel/postgres";

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

// In-memory store for local development (when USE_MEMORY_STORE=true)
const memoryStore: Registration[] = [];
let memoryId = 0;

const useMemory = process.env.USE_MEMORY_STORE === "true";

export async function initDB() {
  if (useMemory) return;

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
}

export async function addRegistration(reg: Omit<Registration, "id" | "created_at">): Promise<Registration> {
  if (useMemory) {
    const entry: Registration = {
      ...reg,
      id: ++memoryId,
      created_at: new Date().toISOString(),
    };
    memoryStore.push(entry);
    return entry;
  }

  await initDB();

  const result = await sql`
    INSERT INTO registrations (name, email, phone, dojo, rank, registration_type, attend_dinner, dietary_requirements)
    VALUES (${reg.name}, ${reg.email}, ${reg.phone}, ${reg.dojo}, ${reg.rank}, ${reg.registration_type}, ${reg.attend_dinner}, ${reg.dietary_requirements})
    RETURNING *
  `;

  return result.rows[0] as Registration;
}

export async function getRegistrations(): Promise<Registration[]> {
  if (useMemory) {
    return [...memoryStore].reverse();
  }

  await initDB();

  const result = await sql`
    SELECT * FROM registrations ORDER BY created_at DESC
  `;

  return result.rows as Registration[];
}

export async function getRegistrationCount(): Promise<number> {
  if (useMemory) {
    return memoryStore.length;
  }

  await initDB();

  const result = await sql`SELECT COUNT(*) as count FROM registrations`;
  return parseInt(result.rows[0].count, 10);
}
