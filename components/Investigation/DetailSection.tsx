import type { InvestigationEventClient } from "@/lib/investigation";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import {
  formatCoordinates,
  pickEventTitle,
  sourceLabel,
} from "@/components/Investigation/utils";

export function DetailSection(props: {
  selectedEvent: InvestigationEventClient | null;
  linkedEvents: InvestigationEventClient[];
  onSelectEvent: (key: string) => void;
}) {
  const { selectedEvent, linkedEvents, onSelectEvent } = props;

  return (
    <section className="lg:col-span-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
        <SectionTitle>Detail</SectionTitle>

        {!selectedEvent ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Select a record to inspect.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{sourceLabel(selectedEvent.source)}</Badge>
              <Badge>{selectedEvent.timestampText}</Badge>
              {selectedEvent.location ? <Badge>{selectedEvent.location}</Badge> : null}
            </div>

            <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-900">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    People
                  </div>
                  <div className="mt-0.5">
                    {selectedEvent.people.length
                      ? selectedEvent.people.join(", ")
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Coordinates
                  </div>
                  <div className="mt-0.5">
                    {formatCoordinates(selectedEvent.coordinates)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Content
                  </div>
                  <div className="mt-0.5 whitespace-pre-wrap">
                    {selectedEvent.content ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <SectionTitle>Linked records</SectionTitle>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {linkedEvents.length}
                </span>
              </div>

              <div className="mt-2 max-h-64 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-900">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
                  {linkedEvents.length ? (
                    linkedEvents.map((evt) => (
                      <li key={evt.key}>
                        <button
                          type="button"
                          onClick={() => onSelectEvent(evt.key)}
                          className="flex w-full flex-col gap-1 bg-white px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950"
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
                    ))
                  ) : (
                    <li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      No linked records found.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
