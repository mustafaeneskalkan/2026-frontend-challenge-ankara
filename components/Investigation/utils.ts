import type {
  InvestigationEventClient,
  InvestigationSource,
} from "@/lib/investigation";
import { SOURCE_LABELS, normalizePersonName } from "@/lib/investigation";

export function normalizeText(input: string): string {
  return input.trim().toLowerCase();
}

export function sourceLabel(source: InvestigationSource): string {
  return SOURCE_LABELS[source] ?? source;
}

export function formatCoordinates(
  coords: { lat: number; lng: number } | null,
): string {
  if (!coords) return "—";
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
}

export function pickEventTitle(evt: InvestigationEventClient): string {
  const people = evt.people.length ? evt.people.join(", ") : "Unknown";
  const where = evt.location ? ` • ${evt.location}` : "";
  return `${people}${where}`;
}

export function buildPeopleIndex(events: InvestigationEventClient[]) {
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
