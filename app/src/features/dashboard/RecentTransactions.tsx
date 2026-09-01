import { Link } from "react-router-dom";
import AmountText from "../../components/ui/AmountText";
import Card from "../../components/ui/Card";
import CategoryIcon from "../../components/ui/CategoryIcon";
import { categoryEmoji, type Transaction } from "../../data";
import { formatDate } from "../../lib/format";

interface RecentTransactionsProps {
  items: (Transaction & { accountName: string })[];
}

export default function RecentTransactions({ items }: RecentTransactionsProps) {
  return (
    <Card className="p-[16px_16px_8px] desktop:p-[22px_24px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15.5px] font-extrabold">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm font-bold text-blue-deep">
          See all →
        </Link>
      </div>
      <div>
        {items.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-[10px_8px] rounded-input hover:bg-hover"
          >
            <CategoryIcon
              emoji={categoryEmoji(tx.category)}
              tone={tx.type === "income" ? "blue" : "orange"}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{tx.description}</div>
              <div className="text-xs text-ink-soft">
                {tx.accountName} · {formatDate(tx.date)}
              </div>
            </div>
            <div className="text-sm">
              <AmountText amount={tx.amount} type={tx.type} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
