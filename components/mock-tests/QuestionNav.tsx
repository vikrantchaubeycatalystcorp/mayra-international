"use client";

import { useTestStore } from "../../lib/mock-tests/store";

export function QuestionNav() {
  const { exam, currentQuestionIndex, answers, goToQuestion } = useTestStore();
  if (!exam) return null;

  // Group questions by subject
  const subjects = new Map<string, number[]>();
  exam.questions.forEach((q, i) => {
    const list = subjects.get(q.subject) || [];
    list.push(i);
    subjects.set(q.subject, list);
  });

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-medium">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Answered
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-gray-300" /> Not visited
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border-2 border-amber-500 bg-amber-100" /> Marked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-indigo-500 ring-2 ring-indigo-300" /> Current
        </div>
      </div>

      {/* Question grid by subject */}
      {Array.from(subjects).map(([subject, indices]) => (
        <div key={subject}>
          <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {subject}
          </h4>
          <div className="grid grid-cols-5 gap-1.5">
            {indices.map((i) => {
              const q = exam.questions[i];
              const answer = answers.get(q.id);
              const isCurrent = i === currentQuestionIndex;
              const isAnswered = !!answer?.selectedOptionId;
              const isMarked = !!answer?.isMarked;

              let bg = "bg-gray-200 text-gray-600 hover:bg-gray-300";
              if (isCurrent) bg = "bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-md";
              else if (isMarked && isAnswered) bg = "bg-emerald-500 text-white ring-2 ring-amber-400";
              else if (isMarked) bg = "bg-amber-100 text-amber-700 ring-2 ring-amber-400";
              else if (isAnswered) bg = "bg-emerald-500 text-white";

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${bg}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="mt-3 rounded-xl bg-gray-50 p-3 space-y-1.5">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Answered</span>
          <span className="font-bold text-emerald-600">
            {Array.from(answers.values()).filter((a) => a.selectedOptionId).length}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Marked</span>
          <span className="font-bold text-amber-600">
            {Array.from(answers.values()).filter((a) => a.isMarked).length}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Unanswered</span>
          <span className="font-bold text-gray-500">
            {Array.from(answers.values()).filter((a) => !a.selectedOptionId).length}
          </span>
        </div>
      </div>
    </div>
  );
}
