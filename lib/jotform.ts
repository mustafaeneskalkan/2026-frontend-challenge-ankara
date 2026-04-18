import type { InvestigationSource } from "@/lib/sources";

export type JotformAnswer = {
  name?: string;
  text?: string;
  type?: string;
  answer?: unknown;
};

export type JotformSubmission = {
  id: string;
  form_id: string;
  created_at?: string;
  updated_at?: string | null;
  answers?: Record<string, JotformAnswer>;
};

export type JotformSubmissionsResponse = {
  responseCode?: number;
  message?: string;
  content?: JotformSubmission[];
};

function getAnswerValue(submission: JotformSubmission, answerName: string): string | null {
  const answers = submission.answers;
  if (!answers) return null;

  for (const value of Object.values(answers)) {
    if (!value) continue;
    if (value.name !== answerName) continue;

    const answer = value.answer;
    if (answer == null) return null;
    if (Array.isArray(answer)) return answer.join(", ");
    return String(answer);
  }

  return null;
}

export function getAnswer(
  submission: JotformSubmission,
  answerName: string,
): string | null {
  return getAnswerValue(submission, answerName);
}

async function loadSampleResponse(
  source: InvestigationSource,
): Promise<JotformSubmissionsResponse | null> {
  // These imports stay server-side and are only used as a fallback.
  switch (source) {
    case "messages":
      return (await import("@/SampleData/Messages.json")).default;
    case "sightings":
      return (await import("@/SampleData/Sightings.json")).default;
    case "personal-notes":
      return (await import("@/SampleData/PersonalNotes.json")).default;
    case "anonymous-tips":
      return (await import("@/SampleData/AnonTips.json")).default;
    case "checkins":
      // No sample file shipped for Checkins in this repo.
      return null;
  }
}

export async function fetchJotformSubmissions(options: {
  formId: string;
  source: InvestigationSource;
  apiKey?: string;
  revalidateSeconds?: number;
}): Promise<{ submissions: JotformSubmission[]; from: "api" | "sample" }> {
  const { formId, source, apiKey, revalidateSeconds = 300 } = options;

  if (!apiKey) {
    const sample = await loadSampleResponse(source);
    const submissions = sample?.content ?? [];
    return { submissions, from: "sample" };
  }

  const url = `https://api.jotform.com/form/${encodeURIComponent(
    formId,
  )}/submissions?apiKey=${encodeURIComponent(apiKey)}&limit=1000`;

  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds, tags: [`jotform:${formId}`] },
  });

  if (!res.ok) {
    throw new Error(
      `Jotform fetch failed (${source}, form ${formId}): ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as JotformSubmissionsResponse;
  const submissions = json.content ?? [];
  return { submissions, from: "api" };
}
