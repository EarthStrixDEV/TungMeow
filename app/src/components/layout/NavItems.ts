import { LayoutDashboard, List, Plus, Settings, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  mobileLabel: string;
  path: string;
  Icon: LucideIcon;
}

/** Desktop sidebar items. */
export const SIDEBAR_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", mobileLabel: "Home", path: "/dashboard", Icon: LayoutDashboard },
  { key: "transactions", label: "Transactions", mobileLabel: "List", path: "/transactions", Icon: List },
  { key: "add", label: "Add Entry", mobileLabel: "", path: "/add", Icon: Plus },
  { key: "settings", label: "Settings", mobileLabel: "Settings", path: "/settings", Icon: Settings },
];

/** Mobile bottom nav slots: Home, List, FAB, Accounts, Settings. */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", mobileLabel: "Home", path: "/dashboard", Icon: LayoutDashboard },
  { key: "transactions", label: "Transactions", mobileLabel: "List", path: "/transactions", Icon: List },
  { key: "add", label: "Add Entry", mobileLabel: "", path: "/add", Icon: Plus },
  { key: "accounts", label: "Accounts", mobileLabel: "Accounts", path: "/settings", Icon: Wallet },
  { key: "settings", label: "Settings", mobileLabel: "Settings", path: "/settings", Icon: Settings },
];
