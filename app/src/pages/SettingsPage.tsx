import ConnectionCard from "../features/settings/ConnectionCard";
import AccountsList from "../features/settings/AccountsList";
import SavingsGoalCard from "../features/settings/SavingsGoalCard";

export default function SettingsPage() {
  return (
    <div className="flex max-w-[900px] flex-col gap-4 desktop:gap-5">
      <header>
        <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Connection &amp; account sheets</p>
      </header>

      <ConnectionCard />
      <AccountsList />
      <SavingsGoalCard />
    </div>
  );
}
