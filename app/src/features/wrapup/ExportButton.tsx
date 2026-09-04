import { useState } from "react";
import { Download } from "lucide-react";
import type { RefObject } from "react";

interface ExportButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
}

export default function ExportButton({ targetRef }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(false);

  const handleExport = async () => {
    if (!targetRef.current) return;
    setExporting(true);
    setError(false);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(targetRef.current, { backgroundColor: null });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "tungmeow-wrapup.png";
      link.click();
    } catch {
      setError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-1.5 rounded-input bg-blue-soft px-4 py-2.5 text-[13px] font-bold text-blue-deep disabled:opacity-60"
      >
        <Download size={16} />
        {exporting ? "Saving…" : "Save as image"}
      </button>
      {error && <p className="text-[12px] text-red">Couldn't save the image — try again.</p>}
    </div>
  );
}
