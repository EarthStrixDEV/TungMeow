import Card from "../../components/ui/Card";
import type { DashboardStats } from "../../data";
import { formatTHB } from "../../lib/format";

interface TopCategoriesProps {
  categories: DashboardStats["topCategories"];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  return (
    <Card className="flex-1 flex flex-col p-[16px_16px_8px] desktop:p-[22px_24px]">
      <h3 className="text-[15.5px] font-extrabold mb-3.5">Top Categories</h3>
      <div className="flex flex-col gap-3.5">
        {categories.map((c, i) => {
          const blue = i % 2 === 0;
          return (
            <div key={c.category}>
              <div className="flex justify-between text-[13px] font-bold mb-1.5">
                <span>
                  {c.emoji} {c.category}
                </span>
                <span>{formatTHB(c.amount)}</span>
              </div>
              <div className={`h-1.5 rounded-full ${blue ? "bg-blue-soft" : "bg-orange-soft"}`}>
                <div
                  className={`h-full rounded-full ${blue ? "bg-blue-decor" : "bg-orange-decor"}`}
                  style={{ width: `${c.pctOfMax}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
