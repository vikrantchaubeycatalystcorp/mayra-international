/**
 * Helpers for working with admin-pasted YouTube / Shorts links.
 *
 * `parseYouTubeId` accepts any common YouTube URL shape and returns the canonical
 * 11-character video ID, which is then used to build privacy-friendly embeds and
 * thumbnail URLs. Used by the admin YouTube Shorts API and the home carousel.
 */

const YT_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extract the 11-char YouTube video ID from any common URL form, or return null.
 *
 * Handles:
 *  - https://www.youtube.com/shorts/<id>
 *  - https://youtu.be/<id>
 *  - https://www.youtube.com/watch?v=<id>
 *  - https://www.youtube.com/embed/<id>
 *  - a bare 11-char ID
 * (with or without trailing query params / extra path segments)
 */
export function parseYouTubeId(input: string): string | null {
  if (!input) return null;
  const raw = input.trim();

  // Already a bare ID
  if (YT_ID_PATTERN.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && YT_ID_PATTERN.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    // watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && YT_ID_PATTERN.test(v)) return v;

    // /shorts/<id>, /embed/<id>, /v/<id>, /live/<id>
    const segments = url.pathname.split("/").filter(Boolean);
    const known = ["shorts", "embed", "v", "live"];
    if (segments.length >= 2 && known.includes(segments[0])) {
      const id = segments[1];
      return YT_ID_PATTERN.test(id) ? id : null;
    }
  }

  return null;
}

/** Thumbnail URL for a video ID (hqdefault is reliably available for all videos). */
export function youTubeThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** High-res thumbnail (may 404 for some older/low-res videos; use as progressive upgrade). */
export function youTubeThumbHq(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

/** Privacy-friendly embed URL for the in-site modal player. */
export function youTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
