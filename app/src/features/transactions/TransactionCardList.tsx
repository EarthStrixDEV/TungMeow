import { useEffect, useRef } from "react";
import AmountText from "../../components/ui/AmountText";
import CategoryIcon from "../../components/ui/CategoryIcon";
import Spinner from "../../components/ui/Spinner";
import { categoryEmoji } from "../../data";
import type { Transaction } from "../../data";
import { formatDate } from "../../lib/format";

interface TransactionCardListProps {
  items: Transaction[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export default function TransactionCardList({
  items,
  hasMore,
  loading,
  onLoadMore,
}: TransactionCardListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !loading) onLoadMore();
      },
      { rootMargin: "120px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="desktop:hidden">
      {items.map((t) => (
        <div key={t.id} className="flex items-center gap-[10px] py-[11px] px-1 border-b border-line">
          <CategoryIcon
            emoji={categoryEmoji(t.category)}
            tone={t.type === "income" ? "blue" : "orange"}
            size={34}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold truncate">{t.description}</p>
            <p className="text-xs text-ink-soft">
              {formatDate(t.date)} · {t.category}
            </p>
          </div>
          <div className="shrink-0 text-[13.5px]">
            <AmountText amount={t.amount} type={t.type} />
          </div>
        </div>
      ))}

      {hasMore && <div ref={sentinelRef} className="h-px" />}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-ink-soft">
          <Spinner />
          Loading…
        </div>
      )}
    </div>
  );
}
