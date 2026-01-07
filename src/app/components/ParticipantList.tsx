import { useState, useRef } from 'react';
import { X, UserPlus, GripVertical, Shuffle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ParticipantListProps {
  participants: string[];
  onAdd: (name: string) => void;
  onRemove: (index: number) => void;
  onReorder: (participants: string[]) => void;
}

interface DragItem {
  index: number;
  type: string;
}

interface DraggableItemProps {
  participant: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (index: number) => void;
}

function DraggableItem({ participant, index, moveItem, onRemove }: DraggableItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'PARTICIPANT',
    item: { index, type: 'PARTICIPANT' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<DragItem>({
    accept: 'PARTICIPANT',
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-2 sm:px-3 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">
          {participant}
        </span>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors shrink-0 ml-2"
        aria-label="Remove participant"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}

export function ParticipantList({ participants, onAdd, onRemove, onReorder }: ParticipantListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const newParticipants = [...participants];
    const [draggedItem] = newParticipants.splice(dragIndex, 1);
    newParticipants.splice(hoverIndex, 0, draggedItem);
    onReorder(newParticipants);
  };

  const shuffleParticipants = () => {
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    onReorder(shuffled);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="참가자 이름을 입력하세요"
            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <UserPlus className="w-4 h-4" />
          </Button>
        </form>

        {/* 랜덤 섞기 버튼 */}
        {participants.length >= 2 && (
          <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={shuffleParticipants}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Shuffle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              순서 섞기
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
          {participants.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm sm:text-base">
              아직 참가자가 없습니다
            </p>
          ) : (
            participants.map((participant, index) => (
              <DraggableItem
                key={`${participant}-${index}`}
                participant={participant}
                index={index}
                moveItem={moveItem}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {participants.length > 0 && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            총 {participants.length}명 참가 중
            <span className="block text-xs mt-1 opacity-70">드래그로 순서 변경 가능</span>
          </p>
        )}
      </div>
    </DndProvider>
  );
}
