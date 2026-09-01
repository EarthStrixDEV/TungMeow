import { Link, NavLink } from "react-router-dom";
import { BOTTOM_NAV_ITEMS } from "./NavItems";

export default function BottomNav() {
  return (
    <nav className="flex desktop:hidden fixed left-0 right-0 bottom-0 h-[78px] items-center bg-surface border-t border-line px-[6px] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-8px_rgba(43,36,32,0.08)] z-50">
      {BOTTOM_NAV_ITEMS.map(({ key, mobileLabel, path, Icon }) => {
        if (key === "add") {
          return (
            <div key={key} className="flex-[0_0_64px] flex items-center justify-center">
              <Link
                to={path}
                aria-label="Add Entry"
                className="w-[52px] h-[52px] -mt-[26px] rounded-full bg-orange flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(184,89,10,0.6)]"
              >
                <Icon size={20} strokeWidth={1.8} className="text-white" />
              </Link>
            </div>
          );
        }
        const tabClass =
          "flex flex-1 flex-col items-center justify-center gap-[3px] pt-[6px] pb-1 text-[10.5px] font-bold";
        if (key === "accounts") {
          // Accounts folds into Settings: links there but never shows active.
          return (
            <Link key={key} to={path} className={`${tabClass} text-ink-faint`}>
              <Icon size={20} strokeWidth={1.8} />
              <span>{mobileLabel}</span>
            </Link>
          );
        }
        return (
          <NavLink
            key={key}
            to={path}
            className={({ isActive }) =>
              `${tabClass} ${isActive ? "text-blue" : "text-ink-faint"}`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{mobileLabel}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
