import { useState, useEffect } from 'react';
import { RouletteWheel } from './components/RouletteWheel';
import { ParticipantList } from './components/ParticipantList';
import { GroupManager, ParticipantGroup } from './components/GroupManager';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Coffee, Moon, Sun } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';

const STORAGE_KEY = 'coffee-roulette-groups';
const THEME_KEY = 'coffee-roulette-theme';

// 순서와 상관없이 두 배열의 구성원이 동일한지 확인
const arraysHaveSameElements = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((item, index) => item === sorted2[index]);
};

export default function App() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 참가자가 변경될 때마다 매칭되는 그룹 찾기
  useEffect(() => {
    if (participants.length === 0) {
      setActiveGroupId(null);
      return;
    }

    const savedGroups = localStorage.getItem(STORAGE_KEY);
    if (!savedGroups) {
      setActiveGroupId(null);
      return;
    }

    try {
      const groups: ParticipantGroup[] = JSON.parse(savedGroups);
      const matchingGroup = groups.find((group) =>
        arraysHaveSameElements(group.participants, participants)
      );

      if (matchingGroup) {
        setActiveGroupId(matchingGroup.id);
      } else {
        setActiveGroupId(null);
      }
    } catch (error) {
      console.error('Failed to find matching group:', error);
      setActiveGroupId(null);
    }
  }, [participants]);

  // 다크 모드 초기화
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // 다크 모드 토글
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
  };

  const handleAddParticipant = (name: string) => {
    setParticipants([...participants, name]);
    // useEffect가 자동으로 매칭되는 그룹을 찾아 활성화
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
    // useEffect가 자동으로 매칭되는 그룹을 찾아 활성화
  };

  const handleReorderParticipants = (newParticipants: string[]) => {
    setParticipants(newParticipants);
    // useEffect가 자동으로 매칭 확인 (순서 상관없이 구성원이 같으면 활성 유지)
  };

  const handleLoadGroup = (groupParticipants: string[], groupId: string) => {
    setParticipants(groupParticipants);
    setActiveGroupId(groupId);
    setWinner(null);
  };

  const handleSpin = () => {
    if (participants.length < 2) {
      alert('최소 2명 이상의 참가자가 필요합니다!');
      return;
    }
    setIsSpinning(true);
    setWinner(null);
    setShowWinnerDialog(false);
  };

  const handleSpinComplete = (winnerName: string) => {
    setIsSpinning(false);
    setWinner(winnerName);
    setShowWinnerDialog(true);

    // 활성 그룹이 있으면 통계 업데이트
    if (activeGroupId) {
      updateGroupStats(activeGroupId, winnerName);
    }
  };

  const updateGroupStats = (groupId: string, winnerName: string) => {
    const savedGroups = localStorage.getItem(STORAGE_KEY);
    if (!savedGroups) return;

    try {
      const groups: ParticipantGroup[] = JSON.parse(savedGroups);
      const updatedGroups = groups.map((group) => {
        if (group.id === groupId) {
          const newStats = { ...group.stats };
          newStats[winnerName] = (newStats[winnerName] || 0) + 1;
          return {
            ...group,
            stats: newStats,
          };
        }
        return group;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));
      
      // GroupManager를 다시 렌더링하기 위해 강제로 업데이트
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to update group stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-12 px-3 sm:px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-12">
          {/* 다크모드 토글 */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className="rounded-full bg-white/80 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Coffee className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600 dark:text-amber-400" />
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100">커피 룰렛</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            오늘 누가 커피를 쏠까요? 룰렛을 돌려보세요!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
          {/* 룰렛 섹션 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8 order-1 lg:order-1">
            <Card className="p-4 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 dark:border dark:border-gray-700">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <RouletteWheel
                  participants={participants}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />

                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || participants.length < 2}
                  size="lg"
                  className="w-full max-w-xs text-base sm:text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600"
                >
                  {isSpinning ? '돌아가는 중...' : '룰렛 돌리기 🎲'}
                </Button>
              </div>
            </Card>

            {/* 사용 방법 - 모바일에서는 맨 아래로 */}
            <Card className="p-4 sm:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-0 dark:border dark:border-gray-700 order-3 lg:order-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">사용 방법</h3>
              <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <li>참가자 이름을 추가하세요 (최소 2명)</li>
                <li>자주 사용하는 그룹은 저장해두고 불러올 수 있습니다</li>
                <li>"룰렛 돌리기" 버튼을 클릭하세요</li>
                <li>룰렛이 돌아가고 당첨자가 결정됩니다</li>
                <li>당첨된 사람이 커피를 사주면 됩니다! ☕</li>
                <li>저장된 그룹을 사용하면 당첨 기록이 자동 저장됩니다</li>
              </ol>
            </Card>
          </div>

          {/* 우측 사이드바 - 모바일에서는 룰렛 바로 아래 */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
            {/* 참가자 목록 섹션 */}
            <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 dark:border dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 text-center">
                참가자 관리
              </h2>
              <ParticipantList
                participants={participants}
                onAdd={handleAddParticipant}
                onRemove={handleRemoveParticipant}
                onReorder={handleReorderParticipants}
              />
            </Card>

            {/* 그룹 관리 섹션 */}
            <GroupManager
              currentParticipants={participants}
              onLoadGroup={handleLoadGroup}
              activeGroupId={activeGroupId}
            />
          </div>
        </div>

        {/* 당첨자 팝업 */}
        <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl text-center dark:text-gray-100">
                🎉 당첨 축하합니다! 🎉
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-center text-lg sm:text-xl pt-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 text-white py-6 sm:py-8 px-4 sm:px-6 rounded-lg shadow-lg mb-4">
                    <p className="text-3xl sm:text-4xl font-bold mb-2">{winner}</p>
                    <p className="text-base sm:text-lg">님이 커피를 쏩니다!</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">☕ 맛있는 커피 한 잔 부탁드립니다 ☕</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => setShowWinnerDialog(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              확인
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}