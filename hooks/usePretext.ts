"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PreparedText, LayoutResult } from "@chenglou/pretext";
import { estimateHeight, parseFontSizePx } from "../lib/pretext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PretextMeasureResult {
  /** Measured height in px (0 during SSR / before fonts load). */
  height: number;
  /** Number of lines the text wraps to. */
  lineCount: number;
  /** `true` once `prepare()` has completed and measurements are accurate. */
  ready: boolean;
}

export interface UsePretextMeasureOptions {
  /**
   * CSS font shorthand — MUST match the rendered CSS exactly.
   * Use `buildFontString()` from `lib/pretext.ts`.
   * Example: `"700 14px Inter"`
   */
  font: string;
  /**
   * CSS `line-height` as a pixel value.
   * Compute as `fontSize * lineHeightMultiplier`.
   */
  lineHeightPx: number;
  /** Fallback width (px) used before the container is measured. */
  fallbackWidth?: number;
}

export interface UsePretextHeightsOptions extends UsePretextMeasureOptions {
  /** Array of text strings to batch-measure. */
  texts: string[];
}

export interface PretextHeightsResult {
  /** Per-item heights in the same order as `texts`. */
  heights: number[];
  /** `true` once all measurements are accurate. */
  ready: boolean;
}

// ---------------------------------------------------------------------------
// Lazy import — keeps Pretext out of the server bundle entirely.
// ---------------------------------------------------------------------------

let _pretext: typeof import("@chenglou/pretext") | null = null;

async function getPretext() {
  if (!_pretext) {
    _pretext = await import("@chenglou/pretext");
  }
  return _pretext;
}

// ---------------------------------------------------------------------------
// Shared: wait for fonts then prepare()
// ---------------------------------------------------------------------------

/** Cache keyed by font string → PreparedText per unique text. */
const prepareCache = new Map<string, Map<string, PreparedText>>();

async function ensurePrepared(
  text: string,
  font: string,
): Promise<PreparedText> {
  // Wait for fonts so Canvas measurements are accurate.
  await document.fonts.ready;

  let fontCache = prepareCache.get(font);
  if (!fontCache) {
    fontCache = new Map();
    prepareCache.set(font, fontCache);
  }

  let prepared = fontCache.get(text);
  if (!prepared) {
    const pt = await getPretext();
    prepared = pt.prepare(text, font);
    fontCache.set(text, prepared);
  }
  return prepared;
}

// ---------------------------------------------------------------------------
// usePretextMeasure — single text measurement
// ---------------------------------------------------------------------------

/**
 * Measures a single text string using Pretext's Canvas-based layout engine.
 *
 * - `prepare()` runs once per unique (text, font) pair and is cached.
 * - `layout()` re-runs only when `width` changes (the hot path).
 * - Returns an SSR-safe fallback until fonts are loaded and the first
 *   accurate measurement completes.
 *
 * Attach `containerRef` to the element whose width you want to track.
 */
export function usePretextMeasure(
  text: string,
  options: UsePretextMeasureOptions,
) {
  const { font, lineHeightPx, fallbackWidth = 300 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const preparedRef = useRef<PreparedText | null>(null);
  const widthRef = useRef(fallbackWidth);

  const fontSizePx = parseFontSizePx(font);
  const fallbackHeight = estimateHeight(
    text,
    fallbackWidth,
    fontSizePx,
    lineHeightPx / fontSizePx,
  );

  const [result, setResult] = useState<PretextMeasureResult>({
    height: fallbackHeight,
    lineCount: Math.max(1, Math.ceil(fallbackHeight / lineHeightPx)),
    ready: false,
  });

  // Perform layout with the current width.
  const doLayout = useCallback(
    async (width: number) => {
      if (!text) {
        setResult({ height: 0, lineCount: 0, ready: true });
        return;
      }

      let prepared = preparedRef.current;
      if (!prepared) {
        prepared = await ensurePrepared(text, font);
        preparedRef.current = prepared;
      }

      const pt = await getPretext();
      const lr: LayoutResult = pt.layout(prepared, width, lineHeightPx);
      setResult({ height: lr.height, lineCount: lr.lineCount, ready: true });
    },
    [text, font, lineHeightPx],
  );

  // Initial measure + ResizeObserver.
  useEffect(() => {
    // Reset prepared ref when text/font changes.
    preparedRef.current = null;

    const el = containerRef.current;
    const initialWidth = el ? el.clientWidth : fallbackWidth;
    widthRef.current = initialWidth;
    doLayout(initialWidth);

    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newWidth = entry.contentRect.width;
      // Only re-layout when width actually changes.
      if (Math.abs(newWidth - widthRef.current) > 0.5) {
        widthRef.current = newWidth;
        doLayout(newWidth);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doLayout, fallbackWidth]);

  return { ...result, containerRef };
}

// ---------------------------------------------------------------------------
// usePretextHeights — batch measurement for lists / grids
// ---------------------------------------------------------------------------

/**
 * Batch-measures an array of text strings. Ideal for virtualised lists or
 * card grids where you need all heights up-front.
 *
 * Attach `containerRef` to a representative-width element (e.g. the grid
 * container or a single-column wrapper).
 */
export function usePretextHeights(options: UsePretextHeightsOptions) {
  const { texts, font, lineHeightPx, fallbackWidth = 300 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(fallbackWidth);

  const fontSizePx = parseFontSizePx(font);
  const lhMultiplier = lineHeightPx / fontSizePx;

  const fallbackHeights = texts.map((t) =>
    estimateHeight(t, fallbackWidth, fontSizePx, lhMultiplier),
  );

  const [result, setResult] = useState<PretextHeightsResult>({
    heights: fallbackHeights,
    ready: false,
  });

  // Stable reference for current texts.
  const textsRef = useRef(texts);
  textsRef.current = texts;

  const doLayout = useCallback(
    async (width: number) => {
      const currentTexts = textsRef.current;
      if (currentTexts.length === 0) {
        setResult({ heights: [], ready: true });
        return;
      }

      const pt = await getPretext();
      await document.fonts.ready;

      const heights = await Promise.all(
        currentTexts.map(async (text) => {
          if (!text) return 0;
          const prepared = await ensurePrepared(text, font);
          const lr: LayoutResult = pt.layout(prepared, width, lineHeightPx);
          return lr.height;
        }),
      );

      setResult({ heights, ready: true });
    },
    [font, lineHeightPx],
  );

  useEffect(() => {
    const el = containerRef.current;
    const initialWidth = el ? el.clientWidth : fallbackWidth;
    widthRef.current = initialWidth;
    doLayout(initialWidth);

    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newWidth = entry.contentRect.width;
      if (Math.abs(newWidth - widthRef.current) > 0.5) {
        widthRef.current = newWidth;
        doLayout(newWidth);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doLayout, fallbackWidth, texts]);

  return { ...result, containerRef };
}
