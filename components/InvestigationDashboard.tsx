"use client";

import { useMemo, useState } from "react";
import type {
  InvestigationEventClient,
  InvestigationSource,
} from "@/lib/investigation";
import { normalizePersonName } from "@/lib/investigation";

import { DetailSection } from "@/components/Investigation/DetailSection";
import { RecordsSection } from "@/components/Investigation/RecordsSection";
import { SearchAside } from "@/components/Investigation/SearchAside";
import type { SearchScope } from "@/components/Investigation/types";
import {
  buildPeopleIndex,
  normalizeText,
  sourceLabel,
} from "@/components/Investigation/utils";

export default function InvestigationDashboard(props: {
  events: InvestigationEventClient[];
  errors: Array<{ source: InvestigationSource; message: string }>;
  from: Record<InvestigationSource, "api" | "none">;
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
    const hasApiData = Object.values(from).some((v) => v === "api");
    if (hasApiData) return null;
    if (events.length) return null;
    return "No records loaded. Set JOTFORM_API_KEY to fetch Jotform submissions.";
  }, [events.length, from]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-12">
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
