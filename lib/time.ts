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
  input: unknown,
): { lat: number; lng: number } | null {
  if (input == null) return null;

  if (Array.isArray(input)) {
    const [latRaw, lngRaw] = input;
    const lat = parseCoordinateNumber(latRaw);
    const lng = parseCoordinateNumber(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;

    const latCandidate =
      obj.lat ?? obj.latitude ?? obj.Latitude ?? obj.LAT ?? obj.LATITUDE;
    const lngCandidate =
      obj.lng ??
      obj.lon ??
      obj.long ??
      obj.longitude ??
      obj.Longitude ??
      obj.LNG ??
      obj.LON ??
      obj.LONG ??
      obj.LONGITUDE;

    if (latCandidate != null && lngCandidate != null) {
      const lat = parseCoordinateNumber(latCandidate);
      const lng = parseCoordinateNumber(lngCandidate);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { lat, lng };
    }

    // Some providers nest this information.
    const nested = obj.coordinates ?? obj.coordinate ?? obj.geo;
    if (nested !== input) return parseCoordinates(nested);
  }

  const value = String(input).trim();
  if (!value) return null;

  // Fast-path for URLs that include q=lat,lng
  if (value.includes("q=")) {
    const match = value.match(/[?&]q=([^&]+)/i);
    if (match?.[1]) {
      const decoded = safeDecode(match[1]);
      const parsed = parseCoordinates(decoded);
      if (parsed) return parsed;
    }
  }

  // Extract the first two numeric values (supports both '.' and ',' decimals).
  const matches = value.match(/-?\d+(?:[\.,]\d+)?/g);
  if (!matches || matches.length < 2) return null;

  const lat = Number.parseFloat(matches[0]!.replace(",", "."));
  const lng = Number.parseFloat(matches[1]!.replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

function parseCoordinateNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const raw = String(value ?? "").trim();
  if (!raw) return Number.NaN;
  const normalized = raw.includes(".") ? raw : raw.replace(/,/g, ".");
  return Number.parseFloat(normalized);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
