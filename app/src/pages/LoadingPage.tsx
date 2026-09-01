import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CatLogo from "../components/brand/CatLogo";
import Spinner from "../components/ui/Spinner";
import { dataService } from "../data";

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const minSplash = new Promise((resolve) => setTimeout(resolve, 1500));
    Promise.all([dataService.init(), minSplash]).then(() => {
      if (!cancelled) navigate("/dashboard", { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="animate-bob mb-[22px]">
        <CatLogo size={96} />
      </div>
      <div className="font-display font-extrabold text-2xl mb-[2px]">TungMeow</div>
      <div className="text-[13px] font-semibold text-ink-soft mb-9">ตังค์เหมียว</div>
      <Spinner />
      <div className="absolute left-0 right-0 bottom-[56px] text-center text-sm font-semibold text-ink-soft">
        Syncing with Google Sheets…
      </div>
    </div>
  );
}
