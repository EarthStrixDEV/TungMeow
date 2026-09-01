import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card";
import AmountInput from "../features/add-entry/AmountInput";
import CategoryChips from "../features/add-entry/CategoryChips";
import TypeToggle from "../features/add-entry/TypeToggle";
import {
  dataService,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Account,
  type TransactionType,
} from "../data";

/** Local-timezone today as yyyy-mm-dd (toISOString would shift across UTC). */
function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const fieldClass =
  "w-full border border-line rounded-input px-3 py-[11px] text-sm text-ink bg-surface outline-none focus:border-blue";

const labelClass = "block mb-[7px] text-[12.5px] font-extrabold text-ink-soft";

export default function AddEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(INCOME_CATEGORIES[0].id);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(todayLocal);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dataService.listAccounts().then((list) => {
      if (cancelled || list.length === 0) return;
      setAccounts(list);
      const fromParam = searchParams.get("account");
      const preset = list.find((a) => a.id === fromParam);
      setAccountId((preset ?? list[0]).id);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (next: TransactionType) => {
    setType(next);
    setCategory((next === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0].id);
  };

  const canSave =
    !saving && parseFloat(amount) > 0 && category !== "" && accountId !== "";

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await dataService.addTransaction({
        accountId,
        date,
        description: note.trim() || category,
        category,
        type,
        amount: parseFloat(amount),
        note: note.trim() || undefined,
      });
      navigate("/transactions?account=" + accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto w-full">
      <header className="mb-[22px]">
        <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Add Entry</h1>
        <p className="mt-1 text-sm text-ink-soft">Saves straight to your Google Sheet</p>
      </header>

      <Card className="p-5 desktop:p-7 flex flex-col gap-5">
        <TypeToggle value={type} onChange={handleTypeChange} />

        <div>
          <span className={labelClass}>Amount (฿)</span>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        <div>
          <span className={labelClass}>Category</span>
          <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        </div>

        <div className="flex flex-col desktop:flex-row gap-4">
          <div className="flex-1">
            <label className={labelClass} htmlFor="add-entry-account">Account</label>
            <select
              id="add-entry-account"
              className={fieldClass}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass} htmlFor="add-entry-date">Date</label>
            <input
              id="add-entry-date"
              type="date"
              className={fieldClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="add-entry-note">Note (optional)</label>
          <input
            id="add-entry-note"
            type="text"
            className={fieldClass}
            placeholder="e.g. Lunch with team"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-soft text-red rounded-input px-4 py-3 text-sm font-bold">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full rounded-[14px] py-[15px] text-[15px] font-extrabold text-white transition-colors ${
            type === "income" ? "bg-blue" : "bg-orange"
          } ${canSave ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          {saving ? "Saving…" : "Save Entry"}
        </button>
      </Card>
    </div>
  );
}
