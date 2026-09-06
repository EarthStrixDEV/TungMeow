import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card";
import AmountInput from "../features/add-entry/AmountInput";
import CategoryChips from "../features/add-entry/CategoryChips";
import TypeToggle from "../features/add-entry/TypeToggle";
import SlipUploadButton from "../features/add-entry/SlipUploadButton";
import OcrProgressIndicator from "../features/add-entry/OcrProgressIndicator";
import OcrFieldBadge from "../features/add-entry/OcrFieldBadge";
import {
  dataService,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Account,
  type OcrSlipResult,
  type TransactionType,
} from "../data";
import { compressAndEncodeImage } from "../lib/imageCompression";
import { notify, confirmPossibleDuplicateSlip } from "../lib/notifications";

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

  const [ocrStage, setOcrStage] = useState<"reading" | "structuring" | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrSlipResult | null>(null);

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

  function applyOcrResult(result: OcrSlipResult) {
    setOcrResult(result);
    if (result.amount.value != null) setAmount(String(result.amount.value));
    if (result.date.value != null) setDate(String(result.date.value));
    setType(result.type);

    const pool = result.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const validCategory = pool.some((c) => c.id === result.category.value);
    setCategory(validCategory ? String(result.category.value) : "Other");

    const parts: string[] = [];
    if (result.refNumber) parts.push(`[Ref: ${result.refNumber}]`);
    if (result.merchant.value) parts.push(`paid to ${result.merchant.value}`);
    setNote(parts.join(" ").slice(0, 500)); // sync with SheetService's 500-char cap on note
  }

  const handleSlipUpload = async (file: File) => {
    try {
      setOcrStage("reading");
      const { base64, mimeType } = await compressAndEncodeImage(file);
      setOcrStage("structuring");
      const result = await dataService.ocrSlip({ imageBase64: base64, mimeType });
      setOcrStage(null);

      if (result.ocrFailed) {
        notify.error({
          title: "Couldn't read this slip",
          text: result.failureReason ?? "Please try again with a clearer photo.",
        });
        return;
      }

      if (result.isLikelyDuplicate && result.duplicateOf) {
        const proceed = await confirmPossibleDuplicateSlip(result.duplicateOf);
        if (!proceed) return;
      }

      applyOcrResult(result);
    } catch {
      setOcrStage(null);
      notify.error({
        title: "Couldn't read this slip",
        text: "Please try again with a clearer photo.",
      });
    }
  };

  const handleClearOcr = () => {
    setOcrResult(null);
    setAmount("");
    setDate(todayLocal());
    setNote("");
  };

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
        <SlipUploadButton onFileSelected={handleSlipUpload} disabled={ocrStage !== null} />
        {ocrStage !== null && <OcrProgressIndicator stage={ocrStage} />}
        {ocrResult && (
          <button
            type="button"
            onClick={handleClearOcr}
            className="self-start text-[12.5px] font-bold text-ink-soft underline decoration-dotted hover:text-ink"
          >
            Clear scanned data
          </button>
        )}

        <TypeToggle value={type} onChange={handleTypeChange} />

        <div>
          <span className={labelClass}>
            Amount (฿) <OcrFieldBadge confidence={ocrResult?.amount.confidence ?? "high"} />
          </span>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        <div>
          <span className={labelClass}>
            Category <OcrFieldBadge confidence={ocrResult?.category.confidence ?? "high"} />
          </span>
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
            <label className={labelClass} htmlFor="add-entry-date">
              Date <OcrFieldBadge confidence={ocrResult?.date.confidence ?? "high"} />
            </label>
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
