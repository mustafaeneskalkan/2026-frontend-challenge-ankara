import type { InvestigationEventView } from "@/components/Investigation/InvestigationContext";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { pickEventTitle, sourceLabel } from "@/components/Investigation/utils";

export function RecordsSection(props: {
  events: InvestigationEventView[];
  selectedEventKey: string | null;
  onSelectEvent: (key: string) => void;
}) {
  const { events, selectedEventKey, onSelectEvent } = props;

  return (
    <section className="lg:col-span-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
        <div className="flex items-center justify-between">
          <SectionTitle>Records</SectionTitle>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Sorted by time
          </span>
        </div>

        <div className="mt-3 max-h-[70vh] overflow-auto rounded-md border border-zinc-200 dark:border-zinc-900">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
            {events.length ? (
              events.map((evt) => {
                const active = evt.key === selectedEventKey;
                return (
                  <li key={evt.key}>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(evt.key)}
                      className={
                        "flex w-full flex-col gap-1 px-3 py-2 text-left text-sm " +
                        (active
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                          : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950")
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                          {pickEventTitle(evt)}
                        </span>
                        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                          {evt.timestampText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{sourceLabel(evt.source)}</Badge>
                        {evt.reliability ? <Badge>{evt.reliability}</Badge> : null}
                      </div>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                No records match your filters.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
