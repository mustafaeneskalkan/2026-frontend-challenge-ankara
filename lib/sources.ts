export type InvestigationSource =
  | "checkins"
  | "messages"
  | "sightings"
  | "personal-notes"
  | "anonymous-tips";

export const ALL_SOURCES: InvestigationSource[] = [
  "checkins",
  "messages",
  "sightings",
  "personal-notes",
  "anonymous-tips",
];

export const FORM_IDS: Record<InvestigationSource, string> = {
  checkins: "261065067494966",
  messages: "261065765723966",
  sightings: "261065244786967",
  "personal-notes": "261065509008958",
  "anonymous-tips": "261065875889981",
};

export const SOURCE_LABELS: Record<InvestigationSource, string> = {
  checkins: "Checkins",
  messages: "Messages",
  sightings: "Sightings",
  "personal-notes": "Personal Notes",
  "anonymous-tips": "Anonymous Tips",
};
