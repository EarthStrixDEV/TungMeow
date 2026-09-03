import CatLogo from "../brand/CatLogo";
import { NavLink } from "react-router-dom";
import { SIDEBAR_ITEMS } from "./NavItems";

export default function Sidebar() {
  return (
    <aside className="hidden desktop:flex w-[240px] shrink-0 sticky top-0 h-screen flex-col gap-1 bg-surface border-r border-line p-[24px_16px]">
      <div className="flex items-center gap-[10px] p-[6px_8px_22px]">
        <CatLogo size={42} />
        <div>
          <div className="font-display font-extrabold text-base leading-[1.1] text-ink">
            TungMeow
          </div>
          <div className="text-[11px] font-semibold text-ink-soft">
            ตังค์เหมียว
          </div>
        </div>
      </div>

      {SIDEBAR_ITEMS.map(({ key, label, path, Icon }) => (
        <NavLink
          key={key}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-3 p-[11px_16px] rounded-[14px] font-bold text-[14.5px] ${
              isActive
                ? "bg-blue text-white shadow-[0_4px_12px_-4px_rgba(58,99,196,0.5)]"
                : "text-ink-soft hover:bg-hover"
            }`
          }
        >
          <Icon size={20} strokeWidth={1.8} className="shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}

      <div className="flex-1" />

      <div className="flex items-center gap-[10px] p-[12px_8px] border-t border-line mt-2">
        <div className="w-[34px] h-[34px] rounded-full bg-blue-soft flex items-center justify-center font-extrabold text-[13px] text-blue-deep shrink-0">
          P
        </div>
        <div>
          <div className="text-[13px] font-bold text-ink">P'Earth</div>
          <div className="text-[11px] text-ink-soft">Synced with Sheets</div>
        </div>
      </div>
    </aside>
  );
}
