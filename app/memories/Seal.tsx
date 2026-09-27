/** Vermilion hanko-style seal reading 五十年 ("fifty years"). */
export function Seal({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Seal reading 五十年, fifty years"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
    >
      <rect x="2" y="2" width="96" height="96" rx="7" fill="#A93226" />
      <rect x="9" y="9" width="82" height="82" rx="3" fill="none" stroke="#F6F1E7" strokeWidth="2.2" />
      <text
        x="50"
        y="50"
        fill="#F6F1E7"
        fontSize="25"
        fontWeight={700}
        textAnchor="middle"
        className="font-jp"
        style={{ writingMode: "vertical-rl" }}
        dominantBaseline="central"
      >
        五十年
      </text>
    </svg>
  );
}
