"use client";

import { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface ShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-sky-50 hover:text-sky-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-50 hover:text-blue-700",
    },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-500 font-medium">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.name}`}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 transition-colors",
            link.color
          )}
        >
          <link.icon className="h-3.5 w-3.5" />
        </a>
      ))}
      <button suppressHydrationWarning
        onClick={handleCopy}
        aria-label="Copy link"
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 transition-colors",
          copied
            ? "bg-green-50 text-green-600 border-green-200"
            : "hover:bg-gray-50 hover:text-gray-700"
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
