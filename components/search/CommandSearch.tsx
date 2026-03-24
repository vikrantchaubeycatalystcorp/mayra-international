"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Search, GraduationCap, BookOpen, FileText, X } from "lucide-react";
import { colleges } from "../../data/colleges";
import { exams } from "../../data/exams";
import { courses } from "../../data/courses";
import { news } from "../../data/news";

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [router, onOpenChange]
  );

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

  const filteredColleges = query
    ? colleges
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.city.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : colleges.filter((c) => c.isFeatured).slice(0, 4);

  const filteredExams = query
    ? exams
        .filter(
          (e) =>
            e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.fullName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
    : exams.filter((e) => e.isFeatured).slice(0, 3);

  const filteredCourses = query
    ? courses
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
    : courses.filter((c) => c.isFeatured).slice(0, 3);

  const filteredNews = query
    ? news
        .filter((n) => n.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
    : news.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        <Command className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0 mr-3" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search colleges, exams, courses, news..."
              className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent"
            />
            <button suppressHydrationWarning
              onClick={() => onOpenChange(false)}
              className="ml-3 flex items-center justify-center h-6 w-6 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>

          <CommandList className="max-h-[60vh] overflow-y-auto p-2">
            <CommandEmpty className="py-8 text-center text-gray-400 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </CommandEmpty>

            {filteredColleges.length > 0 && (
              <CommandGroup heading="Colleges">
                {filteredColleges.map((college) => (
                  <CommandItem
                    key={college.id}
                    value={`college-${college.id}`}
                    onSelect={() =>
                      handleSelect(`/colleges/${college.slug}`)
                    }
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-50 data-[selected]:bg-blue-50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {college.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
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
              <CommandSeparator className="my-1 h-px bg-gray-100" />
            )}

            {filteredExams.length > 0 && (
              <CommandGroup heading="Exams">
                {filteredExams.map((exam) => (
                  <CommandItem
                    key={exam.id}
                    value={`exam-${exam.id}`}
                    onSelect={() => handleSelect(`/exams/${exam.slug}`)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-orange-50 data-[selected]:bg-orange-50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
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
              <CommandSeparator className="my-1 h-px bg-gray-100" />
            )}

            {filteredCourses.length > 0 && (
              <CommandGroup heading="Courses">
                {filteredCourses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={`course-${course.id}`}
                    onSelect={() => handleSelect(`/courses`)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-green-50 data-[selected]:bg-green-50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
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
              <CommandSeparator className="my-1 h-px bg-gray-100" />
            )}

            {filteredNews.length > 0 && !query && (
              <CommandGroup heading="Latest News">
                {filteredNews.map((article) => (
                  <CommandItem
                    key={article.id}
                    value={`news-${article.id}`}
                    onSelect={() => handleSelect(`/news/${article.slug}`)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 data-[selected]:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg bg-gradient-to-br ${article.imageColor} flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
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
          <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">Esc</kbd>
                Close
              </span>
            </div>
            <span className="text-xs text-gray-400">Mayra Search</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
