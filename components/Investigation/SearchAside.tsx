import type { InvestigationSource } from "@/lib/investigation";

import { SectionTitle } from "@/components/Investigation/SectionTitle";
import type { PersonEntry, SearchScope } from "@/components/Investigation/types";
import { sourceLabel } from "@/components/Investigation/utils";

export function SearchAside(props: {
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  search: string;
  onSearchChange: (value: string) => void;

  people: PersonEntry[];
  selectedPersonKey: string | null;
  onTogglePerson: (key: string) => void;
  onClearPerson: () => void;

  apiStatusText: string | null;
  errors: Array<{ source: InvestigationSource; message: string }>;
}) {
  const {
    scope,
    onScopeChange,
    search,
    onSearchChange,
    people,
    selectedPersonKey,
    onTogglePerson,
    onClearPerson,
    apiStatusText,
    errors,
  } = props;

  return (
    <aside className="lg:col-span-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Search</SectionTitle>
            <select
              value={scope}
              onChange={(e) => onScopeChange(e.target.value as SearchScope)}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-900 dark:bg-black dark:text-zinc-100"
            >
              <option value="any">Any</option>
              <option value="person">Person</option>
              <option value="location">Location</option>
              <option value="content">Content</option>
            </select>
          </div>

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-900 dark:bg-black dark:focus:border-zinc-700"
          />

          <div className="flex items-center justify-between">
            <SectionTitle>People</SectionTitle>
            {selectedPersonKey ? (
              <button
                type="button"
                onClick={onClearPerson}
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="max-h-64 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-900">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
              {people.length ? (
                people.map((p) => {
                  const active = selectedPersonKey === p.key;
                  return (
                    <li key={p.key}>
                      <button
                        type="button"
                        onClick={() => onTogglePerson(p.key)}
                        className={
                          "flex w-full items-center justify-between px-3 py-2 text-left text-sm " +
                          (active
                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                            : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950")
                        }
                      >
                        <span className="truncate">{p.label}</span>
                        <span className="ml-3 shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                          {p.count}
                        </span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  No people found.
                </li>
              )}
            </ul>
          </div>

          {apiStatusText ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {apiStatusText}
            </p>
          ) : null}

          {errors.length ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              <div className="font-semibold">Some sources failed</div>
              <ul className="mt-1 list-disc pl-5">
                {errors.map((e, idx) => (
                  <li key={`${e.source}:${idx}`}>
                    {sourceLabel(e.source)}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
