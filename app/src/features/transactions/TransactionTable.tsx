import AmountText from "../../components/ui/AmountText";
import CategoryTag from "../../components/ui/CategoryTag";
import type { Transaction } from "../../data";
import { formatDate } from "../../lib/format";

interface TransactionTableProps {
  items: Transaction[];
}

const TH = "text-left uppercase text-[11.5px] font-extrabold tracking-[0.03em] text-ink-soft px-2 pb-[10px]";
const TD = "py-[12px] px-2 border-t border-line text-[13.5px]";

export default function TransactionTable({ items }: TransactionTableProps) {
  return (
    <table className="hidden desktop:table w-full border-collapse">
      <thead>
        <tr>
          <th className={TH}>Date</th>
          <th className={TH}>Description</th>
          <th className={TH}>Category</th>
          <th className={TH}>Type</th>
          <th className={`${TH} text-right`}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => {
          const tone = t.type === "income" ? "blue" : "orange";
          return (
            <tr key={t.id} className="hover:bg-hover">
              <td className={`${TD} whitespace-nowrap`}>{formatDate(t.date)}</td>
              <td className={`${TD} font-bold`}>{t.description}</td>
              <td className={TD}>
                <CategoryTag tone={tone}>{t.category}</CategoryTag>
              </td>
              <td
                className={`${TD} text-[12.5px] font-bold ${
                  t.type === "income" ? "text-blue-deep" : "text-orange-deep"
                }`}
              >
                {t.type === "income" ? "Income" : "Expense"}
              </td>
              <td className={`${TD} text-right whitespace-nowrap`}>
                <AmountText amount={t.amount} type={t.type} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
