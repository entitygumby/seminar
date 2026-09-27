import type { PublicMemory } from "@/lib/memories-shared";

export function attributionText(m: Pick<PublicMemory, "dojo" | "since_year">) {
  return [m.dojo, m.since_year && `Student since ${m.since_year}`].filter(Boolean).join(" · ");
}
