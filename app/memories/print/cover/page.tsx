import type { Metadata } from "next";
import { Seal } from "../../Seal";
import { CoverFront } from "../CoverFront";
import { CoverToolbar } from "./CoverToolbar";
import { coverSpread, TRIM, type Binding } from "../specs";
import "../print.css";

export const metadata: Metadata = {
  title: "Fifty Years — Cover Spread",
  robots: { index: false },
};

/** Back cover · spine · front cover as one spread, sized to Mixam's cover template. */
export default async function CoverSpread({
  searchParams,
}: {
  searchParams: Promise<{ binding?: string; spine?: string }>;
}) {
  const params = await searchParams;
  const binding: Binding = params.binding === "paperback" ? "paperback" : "hardcover";
  const spineMm = Math.min(80, Math.max(0, Number(params.spine) || 0));
  const s = coverSpread(binding, spineMm);
  const panel = s.bleed + TRIM.width; // each board panel including its outer bleed

  return (
    <div className="print-root">
      <style>{`@page { size: ${s.width}mm ${s.height}mm; margin: 0; }`}</style>
      <CoverToolbar binding={binding} spine={spineMm} width={s.width} height={s.height} />

      <section
        className="sheet cover-spread"
        style={{
          width: `${s.width}mm`,
          height: `${s.height}mm`,
          gridTemplateColumns: `${panel}mm ${s.hinge}mm ${s.spine}mm ${s.hinge}mm ${panel}mm`,
          ["--cover-bleed" as string]: `${s.bleed}mm`,
        }}
      >
        {/* Back cover — content kept centred within the trimmed panel */}
        <div className="cover-panel cover-back" style={{ paddingLeft: `${s.bleed}mm` }}>
          <Seal size={56} />
          <p className="back-line">Dōmo arigatō gozaimashita, Sensei.</p>
          <p className="back-small">Takemusu Aiki Association Inc. &middot; 2026</p>
        </div>
        <div />
        <div className="cover-spine">
          {spineMm >= 6 && (
            <span>
              Fifty Years &nbsp;&middot;&nbsp; Takayasu Sensei &nbsp;&middot;&nbsp; 1976 &ndash; 2026
            </span>
          )}
        </div>
        <div />
        <div className="cover-panel cover-front" style={{ paddingRight: `${s.bleed}mm` }}>
          <CoverFront />
        </div>
      </section>
    </div>
  );
}
