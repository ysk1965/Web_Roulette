import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface TranscriptionAreaProps {
  verseText: string;
  verseReference: string;
  onComplete: () => void;
}

export function TranscriptionArea({ verseText, verseReference, onComplete }: TranscriptionAreaProps) {
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 구절이 변경되면 입력 초기화
    setUserInput("");
    setIsCompleted(false);
    textareaRef.current?.focus();
  }, [verseText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setUserInput(input);

    // 완료 체크
    if (input === verseText && !isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
  };

  const handleReset = () => {
    setUserInput("");
    setIsCompleted(false);
    textareaRef.current?.focus();
  };

  const getCharacterColor = (index: number): string => {
    if (index >= userInput.length) return "text-gray-300";
    if (userInput[index] === verseText[index]) return "text-green-600";
    return "text-red-600";
  };

  const progress = verseText.length > 0 ? (userInput.length / verseText.length) * 100 : 0;
  const accuracy = userInput.length > 0
    ? (userInput.split("").filter((char, i) => char === verseText[i]).length / userInput.length) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* 원본 텍스트 표시 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">{verseReference}</h3>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">완료!</span>
            </div>
          )}
        </div>
        <div className="text-xl leading-relaxed mb-4 font-serif">
          {verseText.split("").map((char, index) => (
            <span key={index} className={getCharacterColor(index)}>
              {char}
            </span>
          ))}
        </div>
        
        {/* 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>진행률: {Math.min(100, Math.round(progress))}%</span>
            <span>정확도: {Math.round(accuracy)}%</span>
          </div>
          <Progress value={Math.min(100, progress)} className="h-2" />
        </div>
      </Card>

      {/* 입력 영역 */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">필사 영역</h3>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 시작
          </Button>
        </div>
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          className="w-full min-h-[150px] p-4 text-xl leading-relaxed border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif resize-none"
          placeholder="여기에 위 구절을 그대로 입력하세요..."
          spellCheck={false}
        />
        <div className="mt-2 text-sm text-gray-500">
          {userInput.length} / {verseText.length} 글자
        </div>
      </Card>
    </div>
  );
}
