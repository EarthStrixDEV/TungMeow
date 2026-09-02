const CX = 100;
const CY = 100;
const R = 80;
const R_INNER = 48;

/** Small fixed palette cycled deterministically by category index — matches the app's blue/orange decor tokens plus a couple of extra hues for >2 categories. */
const SLICE_COLORS = [
  "var(--color-blue-decor)",
  "var(--color-orange-decor)",
  "var(--color-green)",
  "var(--color-red)",
  "var(--color-blue-deep)",
  "var(--color-orange-deep)",
];

function sliceColor(index: number): string {
  return SLICE_COLORS[index % SLICE_COLORS.length];
}

/** Point on a circle of radius `r` centered at (cx, cy) at `angleDeg` (0° = top, clockwise). */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path for a donut slice spanning `startDeg`→`endDeg` between the outer and inner radius. */
function donutSlicePath(startDeg: number, endDeg: number): string {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const outerStart = polarToCartesian(CX, CY, R, startDeg);
  const outerEnd = polarToCartesian(CX, CY, R, endDeg);
  const innerStart = polarToCartesian(CX, CY, R_INNER, endDeg);
  const innerEnd = polarToCartesian(CX, CY, R_INNER, startDeg);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${R} ${R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

/**
 * SVG path for a complete donut ring (100% share). A single 360° arc is
 * degenerate — start and end points coincide, so SVG can't draw it — so we
 * split it into two 180° half-rings (0°→180°, 180°→360°) that together form
 * a full circle.
 */
function donutFullRingPath(): string {
  return [donutSlicePath(0, 180), donutSlicePath(180, 360)].join(" ");
}

interface DonutChartProps {
  categories: { category: string; emoji: string; current: number }[];
  onSliceClick: (category: string) => void;
}

export default function DonutChart({ categories, onSliceClick }: DonutChartProps) {
  const total = categories.reduce((sum, c) => sum + c.current, 0);

  let cursorDeg = 0;
  const slices = categories.map((c, i) => {
    const share = total > 0 ? c.current / total : 0;
    const startDeg = cursorDeg;
    const endDeg = cursorDeg + share * 360;
    cursorDeg = endDeg;
    return { ...c, startDeg, endDeg, share, color: sliceColor(i) };
  });

  return (
    <div className="flex flex-col desktop:flex-row items-center gap-6">
      <svg viewBox="0 0 200 200" width="220" height="220">
        {slices.map((s) =>
          s.share > 0 ? (
            <path
              key={s.category}
              d={s.share >= 1 ? donutFullRingPath() : donutSlicePath(s.startDeg, s.endDeg)}
              fill={s.color}
              className="cursor-pointer"
              onClick={() => onSliceClick(s.category)}
            />
          ) : null,
        )}
      </svg>

      <ul className="flex flex-col gap-2 w-full">
        {slices.map((s) => (
          <li key={s.category}>
            <button
              type="button"
              onClick={() => onSliceClick(s.category)}
              className="w-full flex items-center justify-between gap-2 text-[13px] font-bold cursor-pointer"
            >
              <span className="flex items-center gap-[7px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.emoji} {s.category}
              </span>
              <span className="text-ink-soft">{Math.round(s.share * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
