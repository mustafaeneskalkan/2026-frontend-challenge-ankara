const DEFAULT_JOTFORM_REVALIDATE_SECONDS = 300;

export function getJotformRevalidateSeconds(): number {
  const raw = process.env.JOTFORM_REVALIDATE_SECONDS;
  if (!raw) return DEFAULT_JOTFORM_REVALIDATE_SECONDS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 0) {
    return DEFAULT_JOTFORM_REVALIDATE_SECONDS;
  }

  return parsed;
}
