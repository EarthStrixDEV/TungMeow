import { useEffect, useState } from "react";
import { dataService, type BudgetCap } from "../data";
import ConnectionCard from "../features/settings/ConnectionCard";
import AccountsList from "../features/settings/AccountsList";
import SavingsGoalCard from "../features/settings/SavingsGoalCard";
import BudgetCapCard from "../features/settings/BudgetCapCard";

export default function SettingsPage() {
  const [budgetCaps, setBudgetCaps] = useState<BudgetCap[]>([]);

  useEffect(() => {
    let cancelled = false;
    dataService.getBudgetCaps().then((items) => {
      if (!cancelled) setBudgetCaps(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveBudgetCap = async (category: string, monthlyLimit: number) => {
    await dataService.setBudgetCap(category, monthlyLimit);
    const items = await dataService.getBudgetCaps();
    setBudgetCaps(items);
  };

  return (
    <div className="flex max-w-[900px] flex-col gap-4 desktop:gap-5">
      <header>
        <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Connection &amp; account sheets</p>
      </header>

      <ConnectionCard />
      <AccountsList />
      <SavingsGoalCard />
      <BudgetCapCard budgetCaps={budgetCaps} onSave={handleSaveBudgetCap} />
    </div>
  );
}
