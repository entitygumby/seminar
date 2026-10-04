/**
 * Print specifications. Mixam figures are from their Australian file-setup guide
 * (mixam.com.au/support/filesetup, /support/hardcoversetup) — re-check against the
 * template Mixam shows on the order page before uploading.
 */
export const TRIM = { width: 297, height: 210 }; // A4 landscape, mm

export const MIXAM = {
  interiorBleed: 3, // every inner page
  safeArea: 5, // keep content this far inside the trim
  hardcover: { coverBleed: 20, hinge: 5 }, // wrap around the boards; hinge each side of spine
  paperback: { coverBleed: 3, hinge: 0 },
};

export type Binding = "hardcover" | "paperback";

export function coverSpread(binding: Binding, spine: number) {
  const { coverBleed, hinge } = MIXAM[binding];
  return {
    bleed: coverBleed,
    hinge,
    spine,
    width: coverBleed * 2 + TRIM.width * 2 + hinge * 2 + spine,
    height: coverBleed * 2 + TRIM.height,
  };
}

/** Longest edge a photo reaches on the page: a 3:2 print at the 136 mm single-photo height (see print.css). */
export const LONGEST_PHOTO_MM = 205;

/** Longest photo edge (px) below which a photo prints under ~250 dpi at its largest size on the page. */
export const LOW_RES_PX = Math.round((LONGEST_PHOTO_MM / 25.4) * 250); // ≈ 2,018 px
