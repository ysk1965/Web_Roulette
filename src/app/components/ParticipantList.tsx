import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ParticipantListProps {
  participants: string[];
  onAdd: (name: string) => void;
  onRemove: (index: number) => void;
}

export function ParticipantList({ participants, onAdd, onRemove }: ParticipantListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="참가자 이름을 입력하세요"
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <UserPlus className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {participants.length === 0 ? (
          <p className="text-center text-gray-400 py-4">아직 참가자가 없습니다</p>
        ) : (
          participants.map((participant, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
            >
              <span className="font-medium">{participant}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label="Remove participant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {participants.length > 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          총 {participants.length}명 참가 중
        </p>
      )}
    </div>
  );
}
