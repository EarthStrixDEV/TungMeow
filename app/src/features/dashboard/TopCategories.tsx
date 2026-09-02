import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import type { DashboardStats } from "../../data";
import { formatTHB } from "../../lib/format";

interface TopCategoriesProps {
  categories: DashboardStats["topCategories"];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  return (
    <Card className="flex-1 flex flex-col p-[16px_16px_8px] desktop:p-[22px_24px]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[15.5px] font-extrabold">Top Categories</h3>
        <Link to="/category-breakdown" className="text-sm font-bold text-blue-deep">
          See full breakdown →
        </Link>
      </div>
      <div className="flex flex-col gap-3.5">
        {categories.map((c, i) => {
          const blue = i % 2 === 0;
          return (
            <Link
              key={c.category}
              to={`/transactions?category=${encodeURIComponent(c.category)}`}
              className="block cursor-pointer rounded-input -mx-1 px-1 hover:bg-hover"
            >
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
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
