export const ERAS = ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "Undated"] as const;
export type Era = (typeof ERAS)[number];

export type MemoryStatus = "pending" | "approved" | "rejected";

export interface MemoryPhoto {
  url: string;
  caption: string;
  era: Era;
  width: number;
  height: number;
}

export interface Memory {
  id: number;
  name: string;
  email: string;
  dojo: string;
  since_year: string;
  message: string;
  photos: MemoryPhoto[];
  status: MemoryStatus;
  created_at: string;
}

export type NewMemory = Omit<Memory, "id" | "status" | "created_at">;

/** Public shape — never expose contributor emails. */
export type PublicMemory = Omit<Memory, "email" | "status">;

// Photos already on the seminar site, shown in the album as the club archive.
export const ARCHIVE_PHOTOS: MemoryPhoto[] = [
  { url: "/photos/three-masters.jpg", caption: "With Saito Sensei in Australia, early years", era: "Undated", width: 4789, height: 3076 },
  { url: "/photos/dojo-throw.jpg", caption: "Takayasu Sensei demonstrating at the Iwama dojo", era: "Undated", width: 2048, height: 1536 },
  { url: "/photos/saito-takayasu.jpg", caption: "Takayasu Sensei at Mary Street dojo", era: "Undated", width: 2965, height: 1976 },
  { url: "/photos/weapons-demo.jpg", caption: "Holding Saito Sensei's sword", era: "Undated", width: 6917, height: 4611 },
  { url: "/photos/bokken-practice.jpg", caption: "Weapons demonstration", era: "Undated", width: 3398, height: 2265 },
  { url: "/photos/jo-technique.jpg", caption: "Ken suburi demonstration", era: "Undated", width: 3888, height: 2592 },
];

export function toPublic(m: Memory): PublicMemory {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, status, ...rest } = m;
  return rest;
}

/** All approved photos plus the archive, sorted by era for the album and print edition. */
export function collectPhotos(memories: PublicMemory[]) {
  const items = [
    ...ARCHIVE_PHOTOS.map((p) => ({ ...p, credit: "Club archive" })),
    ...memories.flatMap((m) => m.photos.map((p) => ({ ...p, credit: m.name }))),
  ];
  return items.sort((a, b) => ERAS.indexOf(a.era) - ERAS.indexOf(b.era));
}
