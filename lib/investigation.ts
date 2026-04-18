import { fetchJotformSubmissions, getAnswer, type JotformSubmission } from "@/lib/jotform";
import {
  ALL_SOURCES,
  FORM_IDS,
  SOURCE_LABELS,
  type InvestigationSource,
} from "@/lib/sources";
import { parseCoordinates, parseTimestampToMs } from "@/lib/time";

export type { InvestigationSource } from "@/lib/sources";

export type Reliability = "low" | "medium" | "high" | string;

export type InvestigationEvent = {
  key: string;
  source: InvestigationSource;
  formId: string;
  submissionId: string;

  timestampMs: number;
  timestampText: string;
  createdAtText: string | null;

  location: string | null;
  coordinates: { lat: number; lng: number } | null;

  people: string[];
  content: string | null;
  reliability: Reliability | null;

  raw: JotformSubmission;
};

export type InvestigationEventClient = Omit<InvestigationEvent, "raw">;

export { ALL_SOURCES, FORM_IDS, SOURCE_LABELS };

function splitPeople(input: string | null): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function normalizePersonName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function uniqPreserveOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = normalizePersonName(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function toEventBase(
  source: InvestigationSource,
  formId: string,
  submission: JotformSubmission,
  fields: {
    timestamp: string | null;
    location: string | null;
    coordinates: string | null;
    people: string[];
    content: string | null;
    reliability: Reliability | null;
  },
): InvestigationEvent {
  const createdAtText = submission.created_at ? String(submission.created_at) : null;

  const timestampText = fields.timestamp ?? createdAtText ?? "";
  const timestampMs =
    parseTimestampToMs(fields.timestamp) ??
    parseTimestampToMs(createdAtText) ??
    0;

  return {
    key: `${source}:${submission.id}`,
    source,
    formId,
    submissionId: submission.id,

    timestampMs,
    timestampText,
    createdAtText,

    location: fields.location,
    coordinates: parseCoordinates(fields.coordinates),

    people: uniqPreserveOrder(fields.people),
    content: fields.content,
    reliability: fields.reliability,

    raw: submission,
  };
}

function mapCheckins(formId: string, submission: JotformSubmission): InvestigationEvent {
  // We try to match the Sightings schema first, then fall back to whatever we can infer.
  const personName = getAnswer(submission, "personName");
  const seenWith = getAnswer(submission, "seenWith");
  const timestamp = getAnswer(submission, "timestamp");
  const location = getAnswer(submission, "location");
  const coordinates = getAnswer(submission, "coordinates");
  const note = getAnswer(submission, "note");

  const people = uniqPreserveOrder([
    ...(personName ? [personName] : []),
    ...splitPeople(seenWith),
  ]);

  const content = note;

  return toEventBase("checkins", formId, submission, {
    timestamp,
    location,
    coordinates,
    people,
    content,
    reliability: null,
  });
}

function mapSightings(formId: string, submission: JotformSubmission): InvestigationEvent {
  const personName = getAnswer(submission, "personName");
  const seenWith = getAnswer(submission, "seenWith");
  const timestamp = getAnswer(submission, "timestamp");
  const location = getAnswer(submission, "location");
  const coordinates = getAnswer(submission, "coordinates");
  const note = getAnswer(submission, "note");

  const people = uniqPreserveOrder([
    ...(personName ? [personName] : []),
    ...splitPeople(seenWith),
  ]);

  return toEventBase("sightings", formId, submission, {
    timestamp,
    location,
    coordinates,
    people,
    content: note,
    reliability: null,
  });
}

function mapMessages(formId: string, submission: JotformSubmission): InvestigationEvent {
  const sender = getAnswer(submission, "senderName");
  const recipient = getAnswer(submission, "recipientName");
  const timestamp = getAnswer(submission, "timestamp");
  const location = getAnswer(submission, "location");
  const coordinates = getAnswer(submission, "coordinates");
  const text = getAnswer(submission, "text");
  const urgency = getAnswer(submission, "urgency");

  const people = uniqPreserveOrder([
    ...(sender ? [sender] : []),
    ...(recipient ? [recipient] : []),
  ]);

  return toEventBase("messages", formId, submission, {
    timestamp,
    location,
    coordinates,
    people,
    content: text,
    reliability: urgency,
  });
}

function mapPersonalNotes(formId: string, submission: JotformSubmission): InvestigationEvent {
  const author = getAnswer(submission, "authorName");
  const timestamp = getAnswer(submission, "timestamp");
  const location = getAnswer(submission, "location");
  const coordinates = getAnswer(submission, "coordinates");
  const note = getAnswer(submission, "note");
  const mentionedPeople = getAnswer(submission, "mentionedPeople");

  const people = uniqPreserveOrder([
    ...(author ? [author] : []),
    ...splitPeople(mentionedPeople),
  ]);

  return toEventBase("personal-notes", formId, submission, {
    timestamp,
    location,
    coordinates,
    people,
    content: note,
    reliability: null,
  });
}

function mapAnonymousTips(formId: string, submission: JotformSubmission): InvestigationEvent {
  const timestamp = getAnswer(submission, "timestamp");
  const location = getAnswer(submission, "location");
  const coordinates = getAnswer(submission, "coordinates");
  const suspectName = getAnswer(submission, "suspectName");
  const tip = getAnswer(submission, "tip");
  const confidence = getAnswer(submission, "confidence");

  const people = uniqPreserveOrder([...(suspectName ? [suspectName] : [])]);

  return toEventBase("anonymous-tips", formId, submission, {
    timestamp,
    location,
    coordinates,
    people,
    content: tip,
    reliability: confidence,
  });
}

function mapSubmission(
  source: InvestigationSource,
  formId: string,
  submission: JotformSubmission,
): InvestigationEvent {
  switch (source) {
    case "checkins":
      return mapCheckins(formId, submission);
    case "messages":
      return mapMessages(formId, submission);
    case "sightings":
      return mapSightings(formId, submission);
    case "personal-notes":
      return mapPersonalNotes(formId, submission);
    case "anonymous-tips":
      return mapAnonymousTips(formId, submission);
  }
}

export type InvestigationData = {
  events: InvestigationEvent[];
  from: Record<InvestigationSource, "api" | "none">;
  errors: Array<{ source: InvestigationSource; message: string }>;
};

export async function getInvestigationData(options?: {
  apiKey?: string;
  revalidateSeconds?: number;
}): Promise<InvestigationData> {
  const apiKey = options?.apiKey;
  const revalidateSeconds = options?.revalidateSeconds ?? 300;

  const sources = ALL_SOURCES;

  const from: InvestigationData["from"] = {
    checkins: "none",
    messages: "none",
    sightings: "none",
    "personal-notes": "none",
    "anonymous-tips": "none",
  };

  const errors: InvestigationData["errors"] = [];

  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      const formId = FORM_IDS[source];
      const { submissions, from: fetchedFrom } = await fetchJotformSubmissions({
        formId,
        source,
        apiKey,
        revalidateSeconds,
      });
      return { source, formId, submissions, fetchedFrom };
    }),
  );

  const events: InvestigationEvent[] = [];
  for (const result of settled) {
    if (result.status === "rejected") {
      continue;
    }

    const { source, formId, submissions, fetchedFrom } = result.value;
    from[source] = fetchedFrom;

    for (const submission of submissions) {
      if (!submission?.id) continue;
      events.push(mapSubmission(source, formId, submission));
    }
  }

  // Collect errors from rejected results.
  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    if (result.status === "rejected") {
      const source = sources[i]!;
      errors.push({ source, message: String(result.reason) });
    }
  }

  events.sort((a, b) => b.timestampMs - a.timestampMs);

  return { events, from, errors };
}
