/**
 * Pretext font utilities and constants.
 *
 * Font strings MUST match the CSS font declaration exactly —
 * size, weight, style, family.  We use "Inter" (the named font)
 * everywhere; never "system-ui" because it causes measurement
 * drift on macOS.
 */

// ---------------------------------------------------------------------------
// Font-string builder
// ---------------------------------------------------------------------------

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontStyle = "normal" | "italic";

export interface FontDescriptor {
  /** CSS font-size with unit, e.g. "14px" */
  size: string;
  /** Numeric weight — default 400 */
  weight?: FontWeight;
  /** "normal" | "italic" — default "normal" */
  style?: FontStyle;
  /** Font family name — default "Inter" */
  family?: string;
}

/**
 * Build a CSS font shorthand string that Pretext's `prepare()` accepts.
 *
 * Example output: `"italic 700 14px Inter"`
 */
export function buildFontString(desc: FontDescriptor): string {
  const style = desc.style && desc.style !== "normal" ? `${desc.style} ` : "";
  const weight = desc.weight && desc.weight !== 400 ? `${desc.weight} ` : "";
  const family = desc.family ?? "Inter";
  return `${style}${weight}${desc.size} ${family}`;
}

// ---------------------------------------------------------------------------
// Common font presets used across the app
// ---------------------------------------------------------------------------

/** College card title — `font-bold text-sm` → 700 14px */
export const FONT_CARD_TITLE = buildFontString({ size: "14px", weight: 700 });

/** Course card title — `font-bold text-base` → 700 16px */
export const FONT_COURSE_TITLE = buildFontString({ size: "16px", weight: 700 });

/** Course card description — `text-xs leading-relaxed` → 400 12px */
export const FONT_COURSE_DESC = buildFontString({ size: "12px" });

// ---------------------------------------------------------------------------
// Line-height constants (must match CSS)
// ---------------------------------------------------------------------------

/** `leading-tight` = 1.25 × font-size */
export const LH_TIGHT = 1.25;

/** `leading-relaxed` = 1.625 × font-size */
export const LH_RELAXED = 1.625;

/** Default / `leading-normal` = 1.5 × font-size */
export const LH_NORMAL = 1.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the numeric font-size (in px) from a font string like "700 14px Inter". */
export function parseFontSizePx(fontString: string): number {
  const match = fontString.match(/(\d+(?:\.\d+)?)px/);
  return match ? parseFloat(match[1]) : 16;
}

/**
 * Compute an estimated height for SSR/fallback when Pretext is unavailable.
 * Uses a rough characters-per-line heuristic.
 */
export function estimateHeight(
  text: string,
  widthPx: number,
  fontSizePx: number,
  lineHeightMultiplier: number,
  avgCharWidthRatio = 0.55,
): number {
  if (!text || widthPx <= 0) return 0;
  const avgCharWidth = fontSizePx * avgCharWidthRatio;
  const charsPerLine = Math.max(1, Math.floor(widthPx / avgCharWidth));
  const lines = Math.ceil(text.length / charsPerLine);
  return lines * fontSizePx * lineHeightMultiplier;
}
