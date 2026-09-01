import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col gap-4 desktop:gap-5 p-[20px_18px_96px] desktop:p-[32px_40px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
