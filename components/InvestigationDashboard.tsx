"use client";

import { useMemo, useState } from "react";
import type {
  InvestigationEventClient,
  InvestigationSource,
} from "@/lib/investigation";
import { SOURCE_LABELS, normalizePersonName } from "@/lib/investigation";

type SearchScope = "any" | "person" | "location" | "content";

function normalizeText(input: string): string {
  return input.trim().toLowerCase();
}

function sourceLabel(source: InvestigationSource): string {
  return SOURCE_LABELS[source] ?? source;
}

function formatCoordinates(coords: { lat: number; lng: number } | null): string {
  if (!coords) return "—";
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
}

function buildPeopleIndex(events: InvestigationEventClient[]) {
  const counts = new Map<string, { label: string; count: number }>();
  const byPerson = new Map<string, number[]>();

  events.forEach((evt, idx) => {
    for (const person of evt.people) {
      const key = normalizePersonName(person);
      if (!key) continue;

      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label: person, count: 1 });
      }

      const list = byPerson.get(key);
      if (list) list.push(idx);
      else byPerson.set(key, [idx]);
    }
  });

  const people = Array.from(counts.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return { people, byPerson };
}

function pickEventTitle(evt: InvestigationEventClient): string {
  const people = evt.people.length ? evt.people.join(", ") : "Unknown";
  const where = evt.location ? ` • ${evt.location}` : "";
  return `${people}${where}`;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </h2>
  );
}

export default function InvestigationDashboard(props: {
  events: InvestigationEventClient[];
  errors: Array<{ source: InvestigationSource; message: string }>;
  from: Record<InvestigationSource, "api" | "sample" | "none">;
}) {
  const { events, errors, from } = props;

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<SearchScope>("any");
  const [selectedPersonKey, setSelectedPersonKey] = useState<string | null>(null);
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(
    events[0]?.key ?? null,
  );

  const { people, byPerson } = useMemo(() => buildPeopleIndex(events), [events]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventKey) return null;
    return events.find((e) => e.key === selectedEventKey) ?? null;
  }, [events, selectedEventKey]);

  const filteredEvents = useMemo(() => {
    const needle = normalizeText(search);

    return events.filter((evt) => {
      if (selectedPersonKey) {
        const anyMatch = evt.people.some(
          (p) => normalizePersonName(p) === selectedPersonKey,
        );
        if (!anyMatch) return false;
      }

      if (!needle) return true;

      const peopleText = evt.people.join(" ");
      const locationText = evt.location ?? "";
      const contentText = evt.content ?? "";

      const hayAny = `${sourceLabel(evt.source)} ${evt.timestampText} ${peopleText} ${locationText} ${contentText}`;

      switch (scope) {
        case "person":
          return normalizeText(peopleText).includes(needle);
        case "location":
          return normalizeText(locationText).includes(needle);
        case "content":
          return normalizeText(contentText).includes(needle);
        case "any":
        default:
          return normalizeText(hayAny).includes(needle);
      }
    });
  }, [events, scope, search, selectedPersonKey]);

  const linkedEvents = useMemo(() => {
    if (!selectedEvent) return [];

    const indices = new Set<number>();
    for (const person of selectedEvent.people) {
      const key = normalizePersonName(person);
      const related = byPerson.get(key) ?? [];
      for (const idx of related) indices.add(idx);
    }

    const linked = Array.from(indices)
      .map((idx) => events[idx]!)
      .filter((evt) => evt.key !== selectedEvent.key)
      .sort((a, b) => b.timestampMs - a.timestampMs);

    return linked;
  }, [byPerson, events, selectedEvent]);

  const apiStatusText = useMemo(() => {
    const usingSample = Object.entries(from)
      .filter(([, v]) => v === "sample")
      .map(([k]) => k);
    if (!usingSample.length) return null;
    return `Showing sample data for: ${usingSample
      .map((s) => sourceLabel(s as InvestigationSource))
      .join(", ")}. Set JOTFORM_API_KEY to fetch live.`;
  }, [from]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-900 dark:bg-black">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-7">
              Missing Podo: The Ankara Case
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Investigation dashboard (Jotform submissions)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{filteredEvents.length} records</Badge>
            <Badge>{people.length} people</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle>Search</SectionTitle>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as SearchScope)}
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-900 dark:bg-black dark:focus:border-zinc-700"
              />

              <div className="flex items-center justify-between">
                <SectionTitle>People</SectionTitle>
                {selectedPersonKey ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPersonKey(null)}
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
                            onClick={() => {
                              setSelectedPersonKey((prev) =>
                                prev === p.key ? null : p.key,
                              );
                            }}
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
                {filteredEvents.length ? (
                  filteredEvents.map((evt) => {
                    const active = evt.key === selectedEventKey;
                    return (
                      <li key={evt.key}>
                        <button
                          type="button"
                          onClick={() => setSelectedEventKey(evt.key)}
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
                            {evt.reliability ? (
                              <Badge>{evt.reliability}</Badge>
                            ) : null}
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
                  {selectedEvent.location ? (
                    <Badge>{selectedEvent.location}</Badge>
                  ) : null}
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
                              onClick={() => setSelectedEventKey(evt.key)}
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
                                {evt.reliability ? (
                                  <Badge>{evt.reliability}</Badge>
                                ) : null}
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
      </main>
    </div>
  );
}
