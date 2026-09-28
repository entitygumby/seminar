import type { Metadata } from "next";
import { getMemories, toPublic } from "@/lib/memories";
import { MemoriesView } from "./MemoriesView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fifty Years — A Book of Memories for Takayasu Sensei",
  description:
    "Photographs and messages from students past and present, collected for Takayasu Sensei's 50th anniversary of teaching Aikido in Australia. Contributions close Saturday 10 October 2026.",
  openGraph: {
    title: "Fifty Years — A Book of Memories for Takayasu Sensei",
    description:
      "Share a photo or a message for Takayasu Sensei's 50th anniversary keepsake. Contributions close Saturday 10 October 2026.",
    type: "website",
  },
};

export default async function MemoriesPage() {
  const memories = await getMemories("approved").catch((err) => {
    console.error("Failed to load memories:", err);
    return [];
  });
  return <MemoriesView memories={memories.map(toPublic)} />;
}
