"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { youTubeEmbedUrl } from "../../lib/youtube";

export type ShortItem = {
  id: string;
  title: string;
  videoId: string;
  type: string;
  thumbnail: string;
  category: string | null;
};

type Props = {
  shorts: ShortItem[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
};

export function ShortsPlayerModal({ shorts, index, onClose, onNavigate }: Props) {
  const current = shorts[index];
  const isShort = current?.type === "short";

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + shorts.length) % shorts.length);
  }, [index, shorts.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % shorts.length);
  }, [index, shorts.length, onNavigate]);

  // Keyboard navigation + close, and lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goNext, goPrev]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-20 grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Player */}
      <div
        className="relative z-10 w-full animate-in zoom-in-95 duration-200"
        style={{ maxWidth: isShort ? "min(420px, 92vw)" : "min(960px, 92vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
          style={{ aspectRatio: isShort ? "9 / 16" : "16 / 9", maxHeight: isShort ? "86vh" : undefined }}
        >
          <iframe
            key={current.videoId}
            src={youTubeEmbedUrl(current.videoId, true)}
            title={current.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="mt-3 px-1">
          {current.category && (
            <span className="inline-block mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">
              {current.category}
            </span>
          )}
          <p className="text-white text-sm sm:text-base font-medium line-clamp-2">{current.title}</p>
        </div>
      </div>

      {/* Up / Down navigation (shorts-feed feel) */}
      {shorts.length > 1 && (
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            onClick={goPrev}
            aria-label="Previous video"
            className="grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next video"
            className="grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
