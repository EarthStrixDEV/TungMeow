import { useEffect, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import Card from "../../components/ui/Card";
import { dataService, type ConnectionInfo } from "../../data";
import { formatRelativeTime } from "../../lib/format";
import { confirmDisconnectSheet, notify } from "../../lib/notifications";

const ACTION_BTN =
  "bg-hover border border-line rounded-[10px] px-4 py-2 font-bold text-sm text-ink";

export default function ConnectionCard() {
  const [info, setInfo] = useState<ConnectionInfo | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    dataService.getConnectionInfo().then((data) => {
      if (!cancelled) setInfo(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!info) return null;

  const handleSync = async () => {
    setSyncing(true);
    try {
      setInfo(await dataService.syncNow());
      notify.success({ title: "Sheet synced", text: "Your latest data is ready." });
    } catch (err) {
      notify.error({
        title: "Couldn't sync your sheet",
        text: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!(await confirmDisconnectSheet())) return;

    // Mock: a disconnect endpoint has not been added to the data contract yet.
    notify.info({
      title: "Disconnect is not available yet",
      text: "Your Google Sheet remains connected for now.",
    });
  };

  return (
    <Card className="p-4 desktop:px-6 desktop:py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] bg-green-soft">
            <FileSpreadsheet size={24} className="text-green" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold">Google Sheet — Database</div>
            <div className="text-[13px] text-ink-soft">
              "{info.sheetName}" · Last synced {formatRelativeTime(info.lastSyncedAt)}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-green-soft px-3 py-1 text-xs font-bold text-green">
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-green" />
          Connected
        </span>
      </div>

      <div className="mt-[18px] flex flex-wrap gap-2.5">
        <button
          type="button"
          className={ACTION_BTN}
          onClick={() => window.open(info.sheetUrl, "_blank")}
        >
          Open in Sheets ↗
        </button>
        <button type="button" className={ACTION_BTN} onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync now"}
        </button>
        <button
          type="button"
          className={`${ACTION_BTN} text-orange-deep`}
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    </Card>
  );
}
