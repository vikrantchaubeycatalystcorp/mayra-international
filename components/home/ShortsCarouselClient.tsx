"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight, Play, Youtube } from "lucide-react";
import { cn } from "../../lib/utils";
import { youTubeThumb } from "../../lib/youtube";
import { ShortsPlayerModal, type ShortItem } from "./ShortsPlayerModal";

type Props = {
  shorts: ShortItem[];
  title: string;
  subtitle: string;
  ctaLabel: string | null;
  ctaLink: string | null;
};

function ShortCard({ short, onPlay }: { short: ShortItem; onPlay: () => void }) {
  const isShort = short.type === "short";
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play ${short.title}`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl bg-gray-900 shadow-md ring-1 ring-black/5",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      )}
      style={{ aspectRatio: isShort ? "9 / 16" : "16 / 9" }}
    >
      <Image
        src={short.thumbnail || youTubeThumb(short.videoId)}
        alt={short.title}
        fill
        sizes="(max-width: 640px) 60vw, (max-width: 1024px) 33vw, 22vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* YouTube badge */}
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
        <Youtube className="h-3 w-3 text-red-500" />
        {isShort ? "Short" : "Video"}
      </span>

      {/* Play button */}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
          <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
        </span>
      </span>

      {/* Title */}
      <span className="absolute inset-x-0 bottom-0 p-3 text-left">
        {short.category && (
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/70">
            {short.category}
          </span>
        )}
        <span className="block text-sm font-semibold leading-snug text-white line-clamp-2">{short.title}</span>
      </span>
    </button>
  );
}

export function ShortsCarouselClient({ shorts, title, subtitle, ctaLabel, ctaLink }: Props) {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const [playerIndex, setPlayerIndex] = useState<number | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white relative" ref={sectionRef}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 mb-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              <Youtube className="h-3.5 w-3.5" /> Student Videos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-base max-w-lg">{subtitle}</p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {ctaLabel && ctaLink && (
              <Link
                href={ctaLink}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all duration-300 whitespace-nowrap group"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Previous"
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Next"
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          className={cn(
            "overflow-hidden -mx-1 transition-all duration-700",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          ref={emblaRef}
        >
          <div className="flex touch-pan-y">
            {shorts.map((short, i) => (
              <div
                key={short.id}
                className={cn(
                  "min-w-0 shrink-0 grow-0 px-1.5",
                  short.type === "short"
                    ? "basis-[58%] sm:basis-[33%] lg:basis-[22%]"
                    : "basis-[80%] sm:basis-[50%] lg:basis-[33%]"
                )}
              >
                <ShortCard short={short} onPlay={() => setPlayerIndex(i)} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {snaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === selectedIndex ? "w-6 bg-indigo-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {playerIndex !== null && (
        <ShortsPlayerModal
          shorts={shorts}
          index={playerIndex}
          onClose={() => setPlayerIndex(null)}
          onNavigate={setPlayerIndex}
        />
      )}
    </section>
  );
}
