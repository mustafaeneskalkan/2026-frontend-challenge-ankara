export function parseTimestampToMs(input: string | null | undefined): number | null {
  if (!input) return null;
  const value = String(input).trim();
  if (!value) return null;

  // Format: DD-MM-YYYY HH:mm
  const dmy = value.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
  if (dmy) {
    const [, dd, mm, yyyy, hh, min] = dmy;
    const date = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      0,
      0,
    );
    const ms = date.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  // Format: YYYY-MM-DD HH:mm:ss (Jotform created_at)
  const ymd = value.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (ymd) {
    const [, yyyy, mm, dd, hh, min, ss] = ymd;
    const date = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      ss ? Number(ss) : 0,
      0,
    );
    const ms = date.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;

  return null;
}

export function parseCoordinates(
  input: string | null | undefined,
): { lat: number; lng: number } | null {
  if (!input) return null;
  const value = String(input).trim();
  if (!value) return null;

  const [latRaw, lngRaw] = value.split(",").map((s) => s.trim());
  const lat = Number.parseFloat(latRaw ?? "");
  const lng = Number.parseFloat(lngRaw ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}
