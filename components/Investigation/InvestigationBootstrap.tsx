import type { ReactNode } from "react";

import {
  InvestigationProvider,
  type InvestigationEventView,
} from "@/components/Investigation/InvestigationContext";
import { getInvestigationData } from "@/lib/investigation";

export default async function InvestigationBootstrap(props: {
  children: ReactNode;
}) {
  const apiKey = process.env.JOTFORM_API_KEY;

  const data = await getInvestigationData({ apiKey, revalidateSeconds: 300 });
  const events: InvestigationEventView[] = data.events.map((evt) => ({
    key: evt.key,
    source: evt.source,

    timestampMs: evt.timestampMs,
    timestampText: evt.timestampText,

    location: evt.location,
    coordinates: evt.coordinates,

    people: evt.people,
    content: evt.content,
    reliability: evt.reliability,
  }));

  return (
    <InvestigationProvider value={{ events, errors: data.errors, from: data.from }}>
      {props.children}
    </InvestigationProvider>
  );
}
