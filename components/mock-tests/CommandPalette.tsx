"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Hash, Flag, MinusCircle, ArrowRight } from "lucide-react";
import { useTestStore } from "../../lib/mock-tests/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const { exam, answers, goToQuestion, currentQuestionIndex } = useTestStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const items = useMemo(() => {
    if (!exam) return [];

    const allItems: CommandItem[] = [];

    // Quick jump to question number
    exam.questions.forEach((q, i) => {
      const answer = answers.get(q.id);
      const status = answer?.selectedOptionId ? "answered" : answer?.isMarked ? "marked" : "unanswered";
      allItems.push({
        id: `q-${i}`,
        label: `Question ${i + 1}`,
        description: `${q.subject} - ${q.topic} (${q.difficulty})`,
        type: "question",
        index: i,
        status,
      });
    });

    // Subject jumps
    const subjects = new Map<string, number>();
    exam.questions.forEach((q, i) => {
      if (!subjects.has(q.subject)) subjects.set(q.subject, i);
    });
    subjects.forEach((firstIndex, subject) => {
      allItems.push({
        id: `subj-${subject}`,
        label: `Go to ${subject}`,
        description: "Jump to first question in this subject",
        type: "subject",
        index: firstIndex,
        status: "nav",
      });
    });

    // Special jumps
    const firstUnanswered = exam.questions.findIndex((q) => {
      const a = answers.get(q.id);
      return !a?.selectedOptionId;
    });
    if (firstUnanswered >= 0) {
      allItems.push({
        id: "first-unanswered",
        label: "Next unanswered question",
        description: `Question ${firstUnanswered + 1}`,
        type: "action",
        index: firstUnanswered,
        status: "nav",
      });
    }

    const firstMarked = exam.questions.findIndex((q) => {
      const a = answers.get(q.id);
      return a?.isMarked;
    });
    if (firstMarked >= 0) {
      allItems.push({
        id: "first-marked",
        label: "Next marked question",
        description: `Question ${firstMarked + 1}`,
        type: "action",
        index: firstMarked,
        status: "nav",
      });
    }

    // Filter by query
    if (!query) return allItems.slice(0, 15);

    const q = query.toLowerCase();
    // If query is a number, prioritize that question
    const num = parseInt(query, 10);
    if (!isNaN(num) && num >= 1 && num <= exam.questions.length) {
      const directMatch = allItems.find((item) => item.id === `q-${num - 1}`);
      if (directMatch) return [directMatch, ...allItems.filter((i) => i !== directMatch && matchesQuery(i, q)).slice(0, 9)];
    }

    return allItems.filter((i) => matchesQuery(i, q)).slice(0, 15);
  }, [exam, answers, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: CommandItem) => {
    goToQuestion(item.index);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to question, subject, or type a number..."
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">No results found</p>
          ) : (
            items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === selectedIndex ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <StatusIcon status={item.status} active={i === selectedIndex} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.index === currentQuestionIndex ? "text-indigo-600" : ""}`}>
                    {item.label}
                    {item.index === currentQuestionIndex && (
                      <span className="ml-2 text-[10px] text-indigo-400 font-normal">(current)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                </div>
                <ArrowRight className={`h-3.5 w-3.5 shrink-0 ${i === selectedIndex ? "text-indigo-400" : "text-gray-300"}`} />
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 flex items-center gap-4 text-[10px] text-gray-400">
          <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">&uarr;&darr;</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">Enter</kbd> jump</span>
          <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  type: "question" | "subject" | "action";
  index: number;
  status: "answered" | "marked" | "unanswered" | "nav";
}

function matchesQuery(item: CommandItem, query: string): boolean {
  return (
    item.label.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
}

function StatusIcon({ status, active }: { status: string; active: boolean }) {
  const base = "h-7 w-7 flex items-center justify-center rounded-lg shrink-0";
  switch (status) {
    case "answered":
      return <div className={`${base} bg-emerald-100`}><Hash className="h-3.5 w-3.5 text-emerald-600" /></div>;
    case "marked":
      return <div className={`${base} bg-amber-100`}><Flag className="h-3.5 w-3.5 text-amber-600" /></div>;
    case "unanswered":
      return <div className={`${base} bg-gray-100`}><MinusCircle className="h-3.5 w-3.5 text-gray-400" /></div>;
    default:
      return <div className={`${base} ${active ? "bg-indigo-100" : "bg-gray-100"}`}><ArrowRight className="h-3.5 w-3.5 text-gray-500" /></div>;
  }
}
