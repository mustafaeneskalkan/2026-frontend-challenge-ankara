"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { normalizePersonName } from "@/lib/investigation";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";

import { Badge } from "@/components/Investigation/Badge";
import type { BadgeColor } from "@/components/Investigation/Badge";
import { DetailSection } from "@/components/Investigation/DetailSection";
import { RecordsSection } from "@/components/Investigation/RecordsSection";
import { SearchAside } from "@/components/Investigation/SearchAside";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import type { SearchScope } from "@/components/Investigation/types";
import { normalizeText, sourceLabel } from "@/components/Investigation/utils";
import LeafletMap from "@/components/LeafletMap";

function hasUsableCoordinates(
  coords: { lat: number; lng: number } | null,
): coords is { lat: number; lng: number } {
  if (!coords) return false;
  if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return false;
  if (coords.lat < -90 || coords.lat > 90) return false;
  if (coords.lng < -180 || coords.lng > 180) return false;
  if (coords.lat === 0 && coords.lng === 0) return false;
  return true;
}

export default function InvestigationDashboard() {
  const { events, eventsByKey, people, byPerson, errors, from } = useInvestigation();

  const mapMarkers = useMemo(() => {
    const colorBySource: Record<string, BadgeColor> = {
      sightings: "blue",
      checkins: "green",
      messages: "violet",
      "personal-notes": "amber",
      "anonymous-tips": "red",
    };

    return events
      .filter(
        (
          evt,
        ): evt is (typeof events)[number] & {
          coordinates: { lat: number; lng: number };
        } => hasUsableCoordinates(evt.coordinates),
      )
      .map((evt) => {
        const source = sourceLabel(evt.source);
        const color = colorBySource[evt.source] ?? "zinc";

        return {
          key: evt.key,
          position: evt.coordinates,
          color,
          title: evt.location ?? source,
          subtitle: `${source} • ${evt.timestampText}`,
          popup: (
            <div className="min-w-[220px] max-w-[280px] space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={color}>{source}</Badge>
                {evt.reliability ? (
                  <Badge color="amber">{evt.reliability}</Badge>
                ) : null}
              </div>

              <dl className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-xs">
                <dt className="text-zinc-500 dark:text-zinc-400">Time</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  {evt.timestampText || "—"}
                </dd>

                <dt className="text-zinc-500 dark:text-zinc-400">Location</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  {evt.location ?? "—"}
                </dd>

                <dt className="text-zinc-500 dark:text-zinc-400">People</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  {evt.people.length ? (
                    evt.people.map((name, idx) => (
                      <span key={`${evt.key}:person:${idx}`}>
                        <Link
                          href={`/people/${encodeURIComponent(name)}`}
                          className="underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
                        >
                          {name}
                        </Link>
                        {idx < evt.people.length - 1 ? ", " : null}
                      </span>
                    ))
                  ) : (
                    "—"
                  )}
                </dd>
              </dl>

              {evt.content ? (
                <div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
                    {evt.content}
                  </p>
                </div>
              ) : null}
            </div>
          ),
        };
      });
  }, [events]);

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<SearchScope>("any");
  const [selectedPersonKey, setSelectedPersonKey] = useState<string | null>(null);
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(
    events[0]?.key ?? null,
  );

  const selectedEvent = useMemo(() => {
    if (!selectedEventKey) return null;
    return eventsByKey.get(selectedEventKey) ?? null;
  }, [eventsByKey, selectedEventKey]);

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
    const hasApiData = Object.values(from).some((v) => v === "api");
    if (hasApiData) return null;
    if (events.length) return null;
    return "No records loaded. Set JOTFORM_API_KEY to fetch Jotform submissions.";
  }, [events.length, from]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-12">
        {mapMarkers.length ? (
          <section className="col-span-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle>Records Map</SectionTitle>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-900">
              <LeafletMap markers={mapMarkers} className="h-80 w-full" />
            </div>
          </section>
        ) : null}

        <SearchAside
          scope={scope}
          onScopeChange={setScope}
          search={search}
          onSearchChange={setSearch}
          people={people}
          selectedPersonKey={selectedPersonKey}
          onTogglePerson={(key) => {
            setSelectedPersonKey((prev) => (prev === key ? null : key));
          }}
          onClearPerson={() => setSelectedPersonKey(null)}
          apiStatusText={apiStatusText}
          errors={errors}
        />

        <RecordsSection
          events={filteredEvents}
          selectedEventKey={selectedEventKey}
          onSelectEvent={setSelectedEventKey}
        />

        <DetailSection
          selectedEvent={selectedEvent}
          linkedEvents={linkedEvents}
          onSelectEvent={setSelectedEventKey}
        />
      </main>
    </div>
  );
}
