import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Card from "../../components/ui/Card";
import { dataService, type AccountSummary } from "../../data";
import { formatTHB } from "../../lib/format";

export default function AccountsList() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    let cancelled = false;
    dataService.listAccountSummaries().then((data) => {
      if (!cancelled) setAccounts(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="p-4 desktop:px-6 desktop:py-[22px]">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15.5px] font-extrabold">Accounts</h3>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-input bg-blue-soft px-3 py-2 text-[12.5px] font-bold text-blue-deep"
          onClick={() => setShowComingSoon((v) => !v)}
        >
          <Plus size={16} />
          New account
        </button>
      </div>
      {showComingSoon && (
        <p className="mb-1.5 text-xs text-ink-soft">
          Creating accounts is coming soon — for now, accounts mirror your Sheet tabs.
        </p>
      )}
      <p className="mb-1.5 text-sm text-ink-soft">
        Each account is stored as its own tab in the Google Sheet.
      </p>

      {accounts.map((acc, i) => (
        <div
          key={acc.id}
          className={`flex items-center gap-3.5 px-1.5 py-[13px] ${i > 0 ? "border-t border-line" : ""}`}
        >
          <div
            className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-[17px] ${
              i % 2 === 0 ? "bg-blue-soft" : "bg-orange-soft"
            }`}
          >
            {acc.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{acc.name}</div>
            <div className="text-xs text-ink-soft">
              Sheet tab: "{acc.sheetTabName}" · {acc.rowCount} rows
            </div>
          </div>
          <span className="text-[13.5px] font-extrabold">{formatTHB(acc.balance)}</span>
        </div>
      ))}
    </Card>
  );
}
