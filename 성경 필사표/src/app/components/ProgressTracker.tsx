import { Card } from "./ui/card";
import { CheckCircle2 } from "lucide-react";

interface CompletedVerse {
  book: string;
  chapter: number;
  verse: number;
  completedAt: number;
}

interface ProgressTrackerProps {
  completedVerses: CompletedVerse[];
}

export function ProgressTracker({ completedVerses }: ProgressTrackerProps) {
  const sortedVerses = [...completedVerses].sort((a, b) => b.completedAt - a.completedAt).slice(0, 10);

  if (completedVerses.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">필사 기록</h3>
        <p className="text-gray-500 text-center py-8">아직 완료한 구절이 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">필사 기록</h3>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{completedVerses.length}개 완료</span>
        </div>
      </div>
      <div className="space-y-2">
        {sortedVerses.map((verse, index) => (
          <div
            key={`${verse.book}-${verse.chapter}-${verse.verse}-${verse.completedAt}`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">
                {verse.book} {verse.chapter}:{verse.verse}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(verse.completedAt).toLocaleString("ko-KR")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
