import { useMemo } from "react";
import { SCOPES } from "../lib/data";
import { Switch } from "./Switch";
import type { Shortcut } from "../lib/types";
import type { ScopeFilter } from "./types";

interface SearchPanelProps {
  shortcuts: Shortcut[];
  scope: ScopeFilter;
  modifiedCount: number;
  conflictCount: number;
  onScopeChange: (scope: ScopeFilter) => void;
  onlyModified: boolean;
  onlyConflicts: boolean;
  onOnlyModifiedChange: (value: boolean) => void;
  onOnlyConflictsChange: (value: boolean) => void;
}

/** Bloc de gauche : navigation par portée, filtres et compteurs. */
export function SearchPanel({
  shortcuts,
  scope,
  modifiedCount,
  conflictCount,
  onScopeChange,
  onlyModified,
  onlyConflicts,
  onOnlyModifiedChange,
  onOnlyConflictsChange,
}: SearchPanelProps) {
  const countByScope = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of shortcuts)
      counts.set(s.scope, (counts.get(s.scope) ?? 0) + 1);
    return counts;
  }, [shortcuts]);

  const entries: { id: ScopeFilter; label: string; count: number }[] = [
    { id: "all", label: "Tous les raccourcis", count: shortcuts.length },
    ...SCOPES.map((s) => ({
      id: s.id as ScopeFilter,
      label: s.label,
      count: countByScope.get(s.id) ?? 0,
    })),
  ];

  const stats = [
    { value: shortcuts.length, label: "raccourcis" },
    { value: modifiedCount, label: "modifiés" },
    { value: conflictCount, label: "conflits" },
  ];

  return (
    <aside className="flex flex-col gap-4 self-start rounded-[20px] border border-white/10 bg-[#0844486a] p-2 h-full">
      <div className="flex flex-col rounded-[16px] border border-white/5 bg-white/5 shadow-md">
        <div className="p-2 px-2.5">
          <Switch
            label="Modifiés seulement"
            checked={onlyModified}
            onChange={onOnlyModifiedChange}
          />
        </div>

        <div className="w-full h-[1px] bg-white/5"></div>
        <div className="p-2 px-2.5">
          <Switch
            label="Conflits seulement"
            checked={onlyConflicts}
            onChange={onOnlyConflictsChange}
          />
        </div>
      </div>
      {/* La recherche a rejoint le Header ; ce panneau ne garde que les portées. */}
      <nav aria-label="Portées" className="mb-3 flex flex-col gap-0.5">
        {entries.map((entry) => {
          const active = scope === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onScopeChange(entry.id)}
              className={`flex w-full cursor-pointer items-center justify-between gap-2
                rounded-[12px] border-none px-2.5 py-[5px] text-left font-medium text-[13px]
                ${
                  active
                    ? "bg-[#00d8c9b9] dark:text-content-dark"
                    : "bg-transparent text-content hover:bg-panel2 dark:text-[#98bcbab9] dark:hover:bg-[#00d8ca19]"
                }`}
            >
              <span>{entry.label}</span>
              <span className="text-[13px] font-normal">{entry.count}</span>
            </button>
          );
        })}
      </nav>

      {/* <div className="flex gap-2 border-t border-line pt-4 dark:border-white/10">
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1 text-center">
            <strong className="block text-lg">{stat.value}</strong>
            <span className="text-[11px] text-muted dark:text-muted-dark">
              {stat.label}
            </span>
          </div>
        ))}
      </div> */}
    </aside>
  );
}
