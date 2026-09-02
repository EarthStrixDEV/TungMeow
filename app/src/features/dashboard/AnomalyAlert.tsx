import Card from "../../components/ui/Card";
import type { AnomalyEntry } from "../../lib/anomaly";
import { formatTHB } from "../../lib/format";

interface AnomalyAlertProps {
  anomalies: AnomalyEntry[];
}

export default function AnomalyAlert({ anomalies }: AnomalyAlertProps) {
  if (anomalies.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {anomalies.map((a) => (
        <Card
          key={a.category}
          className="bg-orange-soft p-[14px_16px] desktop:p-[16px_20px] flex items-center gap-2.5"
        >
          <span className="text-[13px] font-bold text-orange-deep">
            {a.emoji} {a.category} is up {a.pctOver.toFixed(0)}% this month ({formatTHB(a.current)} vs average{" "}
            {formatTHB(a.avgPrior3)})
          </span>
        </Card>
      ))}
    </div>
  );
}
