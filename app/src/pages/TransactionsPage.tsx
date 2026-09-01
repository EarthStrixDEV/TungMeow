import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { dataService } from "../data";
import type { Account, Transaction, TransactionPage } from "../data";
import { useMediaQuery } from "../lib/useMediaQuery";
import AccountTabs from "../features/transactions/AccountTabs";
import FilterBar from "../features/transactions/FilterBar";
import type { TypeFilter } from "../features/transactions/FilterBar";
import Pagination from "../features/transactions/Pagination";
import TransactionCardList from "../features/transactions/TransactionCardList";
import TransactionTable from "../features/transactions/TransactionTable";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 250;

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 861px)");

  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced copy of searchInput
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<TransactionPage | null>(null);
  /** Desktop: current page only. Mobile: accumulated pages (infinite scroll). */
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Active account from ?account=; falls back to the first account.
  const paramId = searchParams.get("account");
  const activeAccount =
    accounts?.find((a) => a.id === paramId) ?? accounts?.[0] ?? null;
  const activeId = activeAccount?.id ?? null;

  useEffect(() => {
    dataService.listAccounts().then(setAccounts);
  }, []);

  // Debounce the search box before it hits the query.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Any account/search/filter (or layout-mode) change restarts from page 1.
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [activeId, search, typeFilter, categoryFilter, isDesktop]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setLoading(true);
    dataService
      .listTransactions(activeId, {
        page,
        pageSize: PAGE_SIZE,
        search,
        type: typeFilter,
        category: categoryFilter,
      })
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        setItems((prev) =>
          isDesktop || res.page === 1 ? res.items : [...prev, ...res.items],
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, search, typeFilter, categoryFilter, page, isDesktop]);

  const selectAccount = (id: string) => {
    setSearchParams({ account: id }, { replace: true });
  };

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const hasMore = result !== null && result.page < result.pageCount;
  const empty = result !== null && result.total === 0 && !loading;

  return (
    <div className="flex flex-col gap-4 desktop:gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Transactions</h1>
          <p className="mt-1 text-sm text-ink-soft">Each account keeps its own sheet &amp; table</p>
        </div>
        <Link
          to={activeId ? `/add?account=${activeId}` : "/add"}
          className="hidden desktop:inline-flex items-center gap-2 bg-blue text-white rounded-input font-bold text-[13.5px] px-4 py-2 shadow-[0_4px_12px_-4px_rgba(58,99,196,0.5)]"
        >
          <Plus size={16} strokeWidth={2.4} />
          Add Entry
        </Link>
      </header>

      {accounts === null || activeAccount === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <AccountTabs accounts={accounts} activeId={activeAccount.id} onSelect={selectAccount} />

          <Card className="px-[14px] py-[6px] desktop:px-6 desktop:pt-2 desktop:pb-5">
            <div className="flex flex-col gap-3 py-3 desktop:flex-row desktop:items-center desktop:justify-between desktop:py-4">
              <div className="flex items-center justify-between gap-2 desktop:justify-start">
                <span className="text-[15px] font-extrabold">
                  {activeAccount.icon} {activeAccount.name}
                </span>
                <span className="hidden desktop:inline-flex items-center bg-blue-soft text-blue-deep text-[11.5px] font-bold rounded-full px-[10px] py-1">
                  Sheet: &quot;{activeAccount.sheetTabName}&quot;
                </span>
                {result !== null && (
                  <span className="desktop:hidden text-[11.5px] text-ink-soft">
                    {items.length} of {result.total}
                  </span>
                )}
              </div>
              <FilterBar
                search={searchInput}
                onSearchChange={setSearchInput}
                type={typeFilter}
                onTypeChange={setTypeFilter}
                category={categoryFilter}
                onCategoryChange={setCategoryFilter}
              />
            </div>

            {empty ? (
              <p className="py-12 text-center text-sm text-ink-soft">No transactions found</p>
            ) : (
              <>
                <TransactionTable items={items} />
                <TransactionCardList
                  items={items}
                  hasMore={hasMore}
                  loading={loading}
                  onLoadMore={loadMore}
                />
              </>
            )}

            {!empty && result !== null && (
              <div className="hidden desktop:flex items-center justify-between pt-4 pb-1 px-2">
                <span className="text-[12.5px] text-ink-soft">
                  Showing {items.length} of {result.total} · {activeAccount.name}
                </span>
                <Pagination page={result.page} pageCount={result.pageCount} onPageChange={setPage} />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
