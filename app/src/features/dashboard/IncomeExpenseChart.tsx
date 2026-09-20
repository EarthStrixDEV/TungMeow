import Card from "../../components/ui/Card";
import type { DashboardStats, Period } from "../../data";

const CHART_TOP = 20;
const CHART_BOTTOM = 220;
const CHART_H = CHART_BOTTOM - CHART_TOP;
const AXIS_X = 40;
const AXIS_RIGHT = 600;

/** Round up to a "nice" chart ceiling: 1 / 2 / 2.5 / 5 × 10ⁿ. */
function niceMax(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / pow;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10;
  return nice * pow;
}

function axisLabel(v: number): string {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`;
}

interface IncomeExpenseChartProps {
  chart: DashboardStats["chart"];
  period: Period;
}

export default function IncomeExpenseChart({ chart, period }: IncomeExpenseChartProps) {
  const max = niceMax(Math.max(...chart.flatMap((g) => [g.income, g.expense]), 0));
  const groupW = (AXIS_RIGHT - AXIS_X) / Math.max(chart.length, 1);
  // Gridline labels at max, ⅔, ⅓ and 0 — evenly spaced like the wireframe.
  const gridlines = [1, 2 / 3, 1 / 3, 0];

  return (
    <Card className="flex-1 desktop:flex-[1.6] min-w-0 p-[16px_16px_8px] desktop:p-[22px_24px]">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-1">
        <div>
          <h3 className="text-[15.5px] font-extrabold">Income vs Expense</h3>
          <p className="text-xs text-ink-soft">Last 6 {period}s</p>
        </div>
        <div className="flex gap-3.5 text-xs font-bold text-ink-soft">
          <span className="flex items-center gap-[5px]">
            <span className="w-2 h-2 rounded-full bg-blue-decor" />
            Income
          </span>
          <span className="flex items-center gap-[5px]">
            <span className="w-2 h-2 rounded-full bg-orange-decor" />
            Expense
          </span>
        </div>
      </div>
      <svg viewBox="0 0 620 260" width="100%" className="mt-2.5 block max-w-full">
        <line x1={AXIS_X} y1={CHART_TOP} x2={AXIS_X} y2={CHART_BOTTOM} stroke="var(--color-line)" strokeWidth="1" />
        <line x1={AXIS_X} y1={CHART_BOTTOM} x2={AXIS_RIGHT} y2={CHART_BOTTOM} stroke="var(--color-line)" strokeWidth="1" />
        {gridlines.map((f) => (
          <text
            key={f}
            x={AXIS_X - 6}
            y={CHART_BOTTOM - f * CHART_H + 4}
            fontSize="10"
            fill="var(--color-ink-soft)"
            textAnchor="end"
          >
            {axisLabel(f * max)}
          </text>
        ))}
        {chart.map((g, i) => {
          const gx = AXIS_X + i * groupW + groupW * 0.18;
          const incomeH = (g.income / max) * CHART_H;
          const expenseH = (g.expense / max) * CHART_H;
          return (
            <g key={g.label}>
              <rect
                x={gx}
                y={CHART_BOTTOM - incomeH}
                width="18"
                height={incomeH}
                rx="4"
                fill="var(--color-blue-decor)"
              />
              <rect
                x={gx + 22}
                y={CHART_BOTTOM - expenseH}
                width="18"
                height={expenseH}
                rx="4"
                fill="var(--color-orange-decor)"
              />
              <text
                x={gx + 20}
                y={238}
                fontSize="12"
                fill="var(--color-ink-soft)"
                textAnchor="middle"
              >
                {g.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}
