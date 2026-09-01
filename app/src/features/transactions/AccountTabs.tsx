import type { Account } from "../../data";

interface AccountTabsProps {
  accounts: Account[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function AccountTabs({ accounts, activeId, onSelect }: AccountTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-[2px] desktop:flex-wrap desktop:overflow-visible">
      {accounts.map((a) => {
        const active = a.id === activeId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`shrink-0 rounded-full font-bold whitespace-nowrap px-[14px] py-2 text-[12.5px] desktop:px-[18px] desktop:py-[9px] desktop:text-[13.5px] ${
              active
                ? "bg-blue text-white shadow-[0_4px_12px_-4px_rgba(58,99,196,0.5)]"
                : "bg-surface border border-line text-ink-soft"
            }`}
          >
            {a.icon} {a.name}
          </button>
        );
      })}
    </div>
  );
}
