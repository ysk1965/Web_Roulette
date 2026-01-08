import { Card } from "./ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { Book } from "../data/bibleData";

interface CompletedChapter {
  book: string;
  chapter: number;
  completedAt: number;
}

interface BibleReadingChartProps {
  books: Book[];
  completedChapters: CompletedChapter[];
}

export function BibleReadingChart({ books, completedChapters }: BibleReadingChartProps) {
  const isChapterCompleted = (bookName: string, chapterNumber: number) => {
    return completedChapters.some(
      (c) => c.book === bookName && c.chapter === chapterNumber
    );
  };

  const totalChapters = books.reduce((sum, book) => sum + book.chapters.length, 0);
  const completedCount = completedChapters.length;
  const progress = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">성경 필사표</h3>
          <div className="text-sm text-gray-600 mb-3">
            전체 진행률: {completedCount} / {totalChapters} 장
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-3 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-sm font-semibold text-green-600">
            {Math.round(progress)}%
          </div>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
          {books.map((book) => {
            const bookCompletedCount = book.chapters.filter((ch) =>
              isChapterCompleted(book.name, ch.chapter)
            ).length;
            const bookProgress = (bookCompletedCount / book.chapters.length) * 100;

            return (
              <div key={book.name} className="space-y-3 pb-4 border-b border-gray-200 last:border-b-0">
                {/* 책 제목 및 진행률 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg text-gray-800">{book.name}</h4>
                    <span className="text-sm text-gray-600">
                      {bookCompletedCount}/{book.chapters.length}장
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${bookProgress}%` }}
                    />
                  </div>
                </div>

                {/* 장 번호 그리드 */}
                <div className="grid grid-cols-10 gap-2">
                  {book.chapters.map((chapter) => {
                    const completed = isChapterCompleted(book.name, chapter.chapter);
                    return (
                      <div
                        key={chapter.chapter}
                        className={`relative aspect-square flex items-center justify-center rounded-md border-2 transition-all font-semibold ${
                          completed
                            ? "bg-green-500 border-green-600 text-white shadow-md"
                            : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {completed && (
                          <CheckCircle2 className="w-3 h-3 absolute -top-1 -right-1 text-green-600 bg-white rounded-full" />
                        )}
                        <span className="text-sm">{chapter.chapter}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}