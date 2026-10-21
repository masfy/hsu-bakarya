import { Work } from "../types";

/**
 * Parsing tanggal fleksibel format Indonesia (WITA/WIB/WIT), ISO, atau nama bulan
 * Contoh input:
 * - "18/10/2026, 19.50.59 WITA"
 * - "16 Okt 2026, 08:40 WITA"
 * - "2026-10-18T19:50:59.000Z"
 */
export function parseIndoDate(dateStr: string | undefined | null): number {
  if (!dateStr || typeof dateStr !== "string") return 0;
  const clean = dateStr
    .replace(/\s+(WITA|WIB|WIT)/gi, "")
    .replace(/[–—]/g, "-")
    .trim();

  // 1. Format numerik DD/MM/YYYY atau DD-MM-YYYY (opsional jam HH:mm:ss atau HH.mm.ss)
  const ddmmyyyy = clean.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:,\s*(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?)?/
  );
  if (ddmmyyyy) {
    const [, d, m, y, h, min, s] = ddmmyyyy;
    return new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(d, 10),
      parseInt(h || "0", 10),
      parseInt(min || "0", 10),
      parseInt(s || "0", 10)
    ).getTime();
  }

  // 2. Format dengan nama bulan (contoh: 16 Okt 2026, 08:40)
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    mei: 4,
    may: 4,
    jun: 5,
    jul: 6,
    agu: 7,
    agt: 7,
    aug: 7,
    sep: 8,
    okt: 9,
    oct: 9,
    nov: 10,
    des: 11,
    dec: 11,
  };

  const namedMatch = clean.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:,\s*(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?)?/
  );
  if (namedMatch) {
    const [, d, mon, y, h, min, s] = namedMatch;
    const mIdx = months[mon.toLowerCase().substring(0, 3)] ?? 0;
    return new Date(
      parseInt(y, 10),
      mIdx,
      parseInt(d, 10),
      parseInt(h || "0", 10),
      parseInt(min || "0", 10),
      parseInt(s || "0", 10)
    ).getTime();
  }

  // 3. Fallback standard parse
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) return parsed;

  return 0;
}

/**
 * Ekstrak timestamp angka dari ID karya (contoh: "work-1792208525631" -> 1792208525631)
 */
export function getTimestampFromId(id: string | undefined | null): number {
  if (!id) return 0;
  const match = id.match(/(\d{12,14})/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Mendapatkan timestamp mutakhir efektif dari karya (prioritas: updatedAt > publishedAt > createdAt > timestamp ID)
 */
export function getWorkEffectiveTime(work: Work): number {
  const updated = parseIndoDate(work.updatedAt);
  const published = parseIndoDate(work.publishedAt);
  const created = parseIndoDate(work.createdAt);
  const idTime = getTimestampFromId(work.id);

  return Math.max(updated, published, created, idTime, 0);
}
