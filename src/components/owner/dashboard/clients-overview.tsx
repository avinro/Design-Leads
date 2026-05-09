"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { OwnerDashboardCard } from "@/lib/owner/dashboard-data";
import { ClientAccountCard } from "./client-account-card";

type FilterTab = "all" | "active" | "completed";
type SortKey = "activity" | "name" | "phase";

interface ClientsOverviewProps {
  cards: OwnerDashboardCard[];
}

const FILTER_LABELS: Record<FilterTab, string> = {
  all: "All",
  active: "Active",
  completed: "Completed",
};

const SORT_LABELS: Record<SortKey, string> = {
  activity: "Last activity",
  name: "Client name",
  phase: "Phase",
};

/**
 * Client island for the owner dashboard card grid.
 *
 * Receives pre-fetched cards from the Server Component and handles
 * filter (All / Active / Completed) and sort (Last activity / Name / Phase)
 * entirely client-side — the owner's account count is always small enough
 * that in-memory operations are instant.
 */
export function ClientsOverview({ cards }: ClientsOverviewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [activeSort, setActiveSort] = useState<SortKey>("activity");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Filter
  const filtered =
    activeFilter === "all" ? cards : cards.filter((c) => c.filterBucket === activeFilter);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === "name") {
      return a.account.name.localeCompare(b.account.name);
    }
    if (activeSort === "phase") {
      const pa = a.primaryProject?.current_phase ?? "";
      const pb = b.primaryProject?.current_phase ?? "";
      return pa.localeCompare(pb);
    }
    // Default: last activity descending (most recent first).
    const ta = a.lastActivityAt ?? "";
    const tb = b.lastActivityAt ?? "";
    return tb.localeCompare(ta);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div
          className="flex gap-1 overflow-x-auto rounded-lg border p-1"
          role="tablist"
          aria-label="Filter clients"
        >
          {(["all", "active", "completed"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeFilter === tab}
              onClick={() => {
                setActiveFilter(tab);
              }}
              className={[
                "cursor-pointer rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors",
                activeFilter === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              {FILTER_LABELS[tab]}
              {tab !== "all" && (
                <span className="ml-1.5 tabular-nums opacity-60">
                  ({cards.filter((c) => c.filterBucket === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort dropdown (native select on mobile, custom on larger screens) */}
        <div
          className="relative"
          onBlur={() => {
            setSortMenuOpen(false);
          }}
        >
          <label className="sr-only" htmlFor="dashboard-sort">
            Sort by
          </label>
          <select
            id="dashboard-sort"
            value={activeSort}
            onChange={(e) => {
              setActiveSort(e.target.value as SortKey);
            }}
            className="border-border bg-background text-foreground focus:ring-ring cursor-pointer appearance-none rounded-lg border px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:outline-none sm:hidden"
          >
            {(["activity", "name", "phase"] as SortKey[]).map((key) => (
              <option key={key} value={key}>
                Sort: {SORT_LABELS[key]}
              </option>
            ))}
          </select>

          {/* Custom dropdown for sm+ */}
          <div className="relative hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSortMenuOpen((v) => !v);
              }}
              aria-haspopup="listbox"
              aria-expanded={sortMenuOpen}
              className="text-sm"
            >
              {SORT_LABELS[activeSort]}
              <svg
                className={[
                  "ml-1 size-3.5 transition-transform",
                  sortMenuOpen ? "rotate-180" : "",
                ].join(" ")}
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>

            {sortMenuOpen && (
              <ul
                role="listbox"
                aria-label="Sort options"
                className="bg-popover border-border absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border shadow-md"
              >
                {(["activity", "name", "phase"] as SortKey[]).map((key) => (
                  <li key={key} role="option" aria-selected={activeSort === key}>
                    <button
                      className={[
                        "w-full px-3 py-2 text-left text-sm transition-colors",
                        activeSort === key
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted",
                      ].join(" ")}
                      onClick={() => {
                        setActiveSort(key);
                        setSortMenuOpen(false);
                      }}
                    >
                      {SORT_LABELS[key]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Card grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((card) => (
            <ClientAccountCard key={card.account.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl py-16 text-center">
          <p className="text-foreground text-sm font-semibold">
            No {activeFilter === "all" ? "" : activeFilter} clients yet
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try a different filter or add a new client.
          </p>
        </div>
      )}
    </div>
  );
}
