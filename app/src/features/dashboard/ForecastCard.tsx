import Card from "../../components/ui/Card";
import { computeForecast, MIN_DAYS_FOR_FORECAST } from "../../lib/forecast";
import { formatTHB } from "../../lib/format";
import type { Period } from "../../data";

interface ForecastCardProps {
  balance: number;
  expense: number;
  period: Period;
}

const PERIOD_NOUN: Record<Period, string> = {
  month: "month",
  quarter: "quarter",
  year: "year",
};

export default function ForecastCard({ balance, expense, period }: ForecastCardProps) {
  const { projectedBalance, hasEnoughData } = computeForecast(balance, expense, period);

  if (!hasEnoughData) {
    return (
      <Card className="p-[14px_16px] desktop:p-[16px_20px]">
        <div className="text-[11px] font-bold text-ink-soft mb-1">Cash Flow Forecast</div>
        <p className="text-[13px] text-ink-soft">
          Not enough data yet — your forecast unlocks after the first {MIN_DAYS_FOR_FORECAST} days of the {PERIOD_NOUN[period]}.
        </p>
      </Card>
    );
  }

  const isNegative = projectedBalance !== null && projectedBalance < 0;

  return (
    <Card className={`p-[14px_16px] desktop:p-[16px_20px] ${isNegative ? "bg-red-soft" : ""}`}>
      <div className={`text-[11px] font-bold mb-1 ${isNegative ? "text-red" : "text-ink-soft"}`}>
        Cash Flow Forecast
      </div>
      <p className={`text-[13.5px] font-bold ${isNegative ? "text-red" : "text-ink"}`}>
        If you keep spending at this rate, you'll have{" "}
        <span className="font-extrabold">{formatTHB(projectedBalance!)}</span> left by end of {period}.
      </p>
    </Card>
  );
}
