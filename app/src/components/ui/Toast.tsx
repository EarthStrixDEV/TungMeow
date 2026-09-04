import { useEffect } from "react";
import Card from "./Card";

export interface ToastItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const AUTO_DISMISS_MS = 5000;

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <Card className="w-[280px] p-3 flex items-start gap-2.5 border border-line">
      <span className="text-[24px] leading-none">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-extrabold">{item.title}</div>
        <div className="text-[12px] text-ink-soft">{item.description}</div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="text-ink-faint text-sm leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </Card>
  );
}

export default function ToastStack({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 desktop:bottom-6 desktop:right-6 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
