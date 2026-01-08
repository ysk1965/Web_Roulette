import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Book } from "../data/bibleData";

interface BibleSelectorProps {
  books: Book[];
  selectedBook: string;
  selectedChapter: number;
  selectedVerse: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
  onVerseChange: (verse: number) => void;
}

export function BibleSelector({
  books,
  selectedBook,
  selectedChapter,
  selectedVerse,
  onBookChange,
  onChapterChange,
  onVerseChange,
}: BibleSelectorProps) {
  const currentBook = books.find((book) => book.name === selectedBook);
  const currentChapter = currentBook?.chapters.find((ch) => ch.chapter === selectedChapter);

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium mb-2">책</label>
        <Select value={selectedBook} onValueChange={onBookChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book.name} value={book.name}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium mb-2">장</label>
        <Select value={selectedChapter.toString()} onValueChange={(val) => onChapterChange(Number(val))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentBook?.chapters.map((chapter) => (
              <SelectItem key={chapter.chapter} value={chapter.chapter.toString()}>
                {chapter.chapter}장
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium mb-2">절</label>
        <Select value={selectedVerse.toString()} onValueChange={(val) => onVerseChange(Number(val))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentChapter?.verses.map((verse) => (
              <SelectItem key={verse.verse} value={verse.verse.toString()}>
                {verse.verse}절
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
