export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date));
  } catch {
    return '';
  }
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseNumberInput(value: string): number {
  const normalized = digitsOnly(value);
  if (!normalized) return 0;
  return Number(normalized);
}

export function formatRupiahInput(value: number | string | undefined): string {
  if (value === undefined || value === null) return "";
  const asNumber = typeof value === "number" ? value : parseNumberInput(value);
  if (!Number.isFinite(asNumber) || asNumber === 0) return "";
  return asNumber.toLocaleString("id-ID");
}

export function alphaNumericSpaceOnly(value: string): string {
  return value.replace(/[^a-zA-Z0-9\s]/g, "");
}
