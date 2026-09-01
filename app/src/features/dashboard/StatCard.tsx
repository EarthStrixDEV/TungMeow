import type { ReactNode } from "react";
import Card from "../../components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  pill?: ReactNode;
}

export default function StatCard({ label, value, icon, pill }: StatCardProps) {
  return (
    <Card className="flex-1 p-[14px_16px] desktop:p-[20px_22px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink-soft">{label}</span>
        {icon}
      </div>
      <div className="mt-2.5 text-[28px] font-extrabold">{value}</div>
      {pill && <div className="mt-2">{pill}</div>}
    </Card>
  );
}
