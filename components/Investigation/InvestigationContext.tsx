"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  InvestigationSource,
  Reliability,
} from "@/lib/investigation";
import { buildPeopleIndex } from "@/components/Investigation/utils";
import type { PersonEntry } from "@/components/Investigation/types";

export type InvestigationEventView = {
  key: string;
  source: InvestigationSource;

  timestampMs: number;
  timestampText: string;

  location: string | null;
  coordinates: { lat: number; lng: number } | null;

  people: string[];
  content: string | null;
  reliability: Reliability | null;
};

export type InvestigationStats = {
  recordsTotal: number;
  peopleTotal: number;
  sourcesTotal: number;
  sourcesApi: number;
  sourcesFailed: number;
  latestTimestampText: string | null;
};

export type InvestigationContextValue = {
  events: InvestigationEventView[];
  eventsByKey: Map<string, InvestigationEventView>;
  people: PersonEntry[];
  byPerson: Map<string, number[]>;
  stats: InvestigationStats;
  errors: Array<{ source: InvestigationSource; message: string }>;
  from: Record<InvestigationSource, "api" | "none">;
};

const InvestigationContext = createContext<InvestigationContextValue | null>(
  null,
);

export function InvestigationProvider(props: {
  value: {
    events: InvestigationEventView[];
    errors: Array<{ source: InvestigationSource; message: string }>;
    from: Record<InvestigationSource, "api" | "none">;
  };
  children: ReactNode;
}) {
  const computed = useMemo<InvestigationContextValue>(() => {
    const { people, byPerson } = buildPeopleIndex(props.value.events);
    const eventsByKey = new Map<string, InvestigationEventView>();
    for (const evt of props.value.events) eventsByKey.set(evt.key, evt);

    const sourcesTotal = Object.keys(props.value.from).length;
    const sourcesApi = Object.values(props.value.from).filter((v) => v === "api")
      .length;
    const sourcesFailed = new Set(props.value.errors.map((e) => e.source)).size;
    const latestTimestampText = props.value.events[0]?.timestampText ?? null;

    return {
      events: props.value.events,
      eventsByKey,
      people,
      byPerson,
      stats: {
        recordsTotal: props.value.events.length,
        peopleTotal: people.length,
        sourcesTotal,
        sourcesApi,
        sourcesFailed,
        latestTimestampText,
      },
      errors: props.value.errors,
      from: props.value.from,
    };
  }, [props.value.events, props.value.errors, props.value.from]);

  return (
    <InvestigationContext.Provider value={computed}>
      {props.children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation(): InvestigationContextValue {
  const value = useContext(InvestigationContext);
  if (!value) {
    throw new Error(
      "useInvestigation must be used within an InvestigationProvider",
    );
  }
  return value;
}
