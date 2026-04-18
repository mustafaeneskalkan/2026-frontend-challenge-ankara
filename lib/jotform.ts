import type { InvestigationSource } from "@/lib/sources";
import { getJotformRevalidateSeconds } from "@/lib/env";

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

export async function fetchJotformSubmissions(options: {
  formId: string;
  source: InvestigationSource;
  apiKey?: string;
  revalidateSeconds?: number;
}): Promise<{ submissions: JotformSubmission[]; from: "api" }> {
  const { formId, source, apiKey } = options;
  const revalidateSeconds = options.revalidateSeconds ?? getJotformRevalidateSeconds();

  if (!apiKey) {
    throw new Error("Missing JOTFORM_API_KEY");
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
