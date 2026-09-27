import { Seal } from "../Seal";

export function CoverFront() {
  return (
    <>
      <Seal size={110} />
      <p className="cover-dates">1976 &mdash; 2026</p>
      <h1 className="cover-title">Fifty Years</h1>
      <p className="cover-sub">A book of memories for</p>
      <p className="cover-name">Takayasu Sensei</p>
      <div className="cover-rule" />
      <p className="cover-from">
        With gratitude from the students of the
        <br />
        Takemusu Aiki Association
      </p>
    </>
  );
}
