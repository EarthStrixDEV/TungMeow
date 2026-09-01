interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const ELLIPSIS = "…";

/** `1 … 4 [5] 6 … 12` — first, last, and a 1-page window around the current. */
function pageItems(page: number, pageCount: number): (number | typeof ELLIPSIS)[] {
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | typeof ELLIPSIS)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(ELLIPSIS);
    out.push(p);
    prev = p;
  }
  return out;
}

const CHIP = "w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[12px]";

export default function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={`${CHIP} font-bold bg-hover text-ink-soft disabled:opacity-40`}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pageItems(page, pageCount).map((item, i) =>
        item === ELLIPSIS ? (
          <span key={`e${i}`} className={`${CHIP} text-ink-faint`}>
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`${CHIP} ${
              item === page ? "bg-blue text-white font-extrabold" : "bg-hover text-ink-soft font-bold"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className={`${CHIP} font-bold bg-hover text-ink-soft disabled:opacity-40`}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
