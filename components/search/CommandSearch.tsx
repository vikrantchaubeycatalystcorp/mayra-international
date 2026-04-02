"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import { Search, GraduationCap, BookOpen, FileText, X, Sparkles } from "lucide-react";

interface SearchCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  nirfRank?: number | null;
  isFeatured?: boolean;
}

interface SearchExam {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  conductingBody: string;
  isFeatured?: boolean;
}

interface SearchCourse {
  id: string;
  name: string;
  slug: string;
  level: string;
  duration: string;
  isFeatured?: boolean;
}

interface SearchNewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageColor: string;
}

interface SearchResults {
  colleges: SearchCollege[];
  exams: SearchExam[];
  courses: SearchCourse[];
  articles: SearchNewsArticle[];
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ colleges: [], exams: [], courses: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [router, onOpenChange]
  );

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const searchQuery = query.trim() || "";
      const url = searchQuery
        ? `/api/search?q=${encodeURIComponent(searchQuery)}&limit=4`
        : `/api/search?q=&limit=4`;

      setLoading(true);
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          setResults({
            colleges: data.colleges || [],
            exams: data.exams || [],
            courses: data.courses || [],
            articles: data.articles || [],
          });
        })
        .catch(() => setResults({ colleges: [], exams: [], courses: [], articles: [] }))
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  if (!open) return null;

  const filteredColleges = results.colleges.slice(0, 4);
  const filteredExams = results.exams.slice(0, 3);
  const filteredCourses = results.courses.slice(0, 3);
  const filteredNews = results.articles.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-premium-lg overflow-hidden animate-scale-in border border-gray-100/50">
        <Command className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-indigo-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em]">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-100/50 px-5 py-4">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0 mr-3">
              <Search className="h-4 w-4 text-indigo-500" />
            </div>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search colleges, exams, courses, news..."
              className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent font-medium"
            />
            <button suppressHydrationWarning
              onClick={() => onOpenChange(false)}
              className="ml-3 flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100/80 hover:bg-gray-200 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>

          <CommandList className="max-h-[60vh] overflow-y-auto p-2">
            <CommandEmpty className="py-10 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-gray-400 text-xs mt-1">Try different keywords</p>
            </CommandEmpty>

            {filteredColleges.length > 0 && (
              <CommandGroup heading="Colleges">
                {filteredColleges.map((college) => (
                  <CommandItem
                    key={college.id}
                    value={`college-${college.id}`}
                    onSelect={() => handleSelect(`/colleges/${college.slug}`)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-indigo-50/50 data-[selected]:bg-indigo-50/50 transition-all duration-200"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                      {college.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {college.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {college.city}, {college.state}
                        {college.nirfRank ? ` · NIRF #${college.nirfRank}` : ""}
                      </p>
                    </div>
                    <GraduationCap className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredColleges.length > 0 && filteredExams.length > 0 && (
              <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
            )}

            {filteredExams.length > 0 && (
              <CommandGroup heading="Exams">
                {filteredExams.map((exam) => (
                  <CommandItem
                    key={exam.id}
                    value={`exam-${exam.id}`}
                    onSelect={() => handleSelect(`/exams/${exam.slug}`)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-orange-50/50 data-[selected]:bg-orange-50/50 transition-all duration-200"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {exam.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {exam.conductingBody}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredExams.length > 0 && filteredCourses.length > 0 && (
              <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
            )}

            {filteredCourses.length > 0 && (
              <CommandGroup heading="Courses">
                {filteredCourses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={`course-${course.id}`}
                    onSelect={() => handleSelect(`/courses`)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-emerald-50/50 data-[selected]:bg-emerald-50/50 transition-all duration-200"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {course.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.level} · {course.duration}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredCourses.length > 0 && filteredNews.length > 0 && (
              <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
            )}

            {filteredNews.length > 0 && !query && (
              <CommandGroup heading="Latest News">
                {filteredNews.map((article) => (
                  <CommandItem
                    key={article.id}
                    value={`news-${article.id}`}
                    onSelect={() => handleSelect(`/news/${article.slug}`)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50/80 data-[selected]:bg-gray-50/80 transition-all duration-200"
                  >
                    <div
                      className={`h-9 w-9 rounded-xl bg-gradient-to-br ${article.imageColor} flex-shrink-0 shadow-sm`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">{article.category}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer */}
          <div className="border-t border-gray-100/50 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-gray-100/80 font-mono text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-gray-100/80 font-mono text-[10px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-gray-100/80 font-mono text-[10px]">Esc</kbd>
                Close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Mayra Search
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
